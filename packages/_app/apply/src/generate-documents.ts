import { updateApplication } from "@rja-api/application/api/update-application"
import { getCompany } from "@rja-api/company/api/get-company"
import { buildCoverLetterDocx } from "@rja-api/cover-letter/api/build-cover-letter-docx"
import { buildCoverLetterPrompt } from "@rja-api/cover-letter/api/build-cover-letter-prompt"
import { generateCoverLetterContent } from "@rja-api/cover-letter/api/generate-cover-letter"
import { buildKeywordPrompt } from "@rja-api/resume/api/build-keyword-prompt"
import { buildResumeDocx } from "@rja-api/resume/api/build-resume-docx"
import { buildResumePrompt } from "@rja-api/resume/api/build-resume-prompt"
import { extractKeywords } from "@rja-api/resume/api/extract-keywords"
import { generateResumeContent } from "@rja-api/resume/api/generate-resume"
import { getRole } from "@rja-api/role/api/get-role"
import { getUserProfile } from "@rja-api/settings/api/get-user-profile"
import { uploadFile } from "@rja-api/storage/api/upload-file"
import { errFrom, ok, type TResult } from "@rja-core/result"
import type { TGenerateDocumentsResult } from "./types"

const STORAGE_BUCKET = "applications"

function cleanDisplayName(name: string): string {
	const cleaned = name.replace(/[\\/:*?"<>|]/g, "").trim()
	return cleaned || "Applicant"
}

type TGenerateDocumentsInput = {
	roleId: number
	applicationId: number
}

export async function generateDocuments(
	input: TGenerateDocumentsInput,
): Promise<TResult<TGenerateDocumentsResult>> {
	const profileResult = getUserProfile()
	if (!profileResult.ok)
		return errFrom(
			`Failed to fetch user profile: ${profileResult.error.message}`,
		)
	const profile = profileResult.data

	const roleResult = getRole(input.roleId)
	if (!roleResult.ok)
		return errFrom(`Failed to fetch role: ${roleResult.error.message}`)
	const role = roleResult.data

	const companyResult = role.companyId ? getCompany(role.companyId) : null
	const company = companyResult?.ok ? companyResult.data : null

	// Extract keywords
	const keywordPrompt = buildKeywordPrompt(role, company)
	const keywords = await extractKeywords(
		keywordPrompt.system,
		keywordPrompt.user,
	)

	// Generate resume
	const resumePrompt = buildResumePrompt(role, company, profile, keywords)
	const resumeContent = await generateResumeContent(
		resumePrompt.system,
		resumePrompt.user,
	)
	const resumeBuffer = await buildResumeDocx(profile.name, resumeContent, {
		email: profile.email,
		phone: profile.phone,
		links: profile.links,
		location: profile.location,
	})

	// Generate cover letter
	const coverLetterPrompt = buildCoverLetterPrompt(role, company, profile)
	const coverLetterContent = await generateCoverLetterContent(
		coverLetterPrompt.system,
		coverLetterPrompt.user,
	)
	const coverLetterBuffer = await buildCoverLetterDocx(
		profile.name,
		coverLetterContent,
		{
			email: profile.email,
			phone: profile.phone,
			links: profile.links,
			location: profile.location,
		},
	)

	// Upload documents with human-looking filenames so form uploads don't look AI-generated
	const displayName = cleanDisplayName(profile.name)
	const resumePath = `${role.id}/${displayName} Resume.docx`
	const coverLetterPath = `${role.id}/${displayName} Cover Letter.docx`

	const resumeUpload = await uploadFile(
		STORAGE_BUCKET,
		resumePath,
		resumeBuffer,
	)
	if (!resumeUpload.ok)
		return errFrom(`Failed to upload resume: ${resumeUpload.error.message}`)

	const coverLetterUpload = await uploadFile(
		STORAGE_BUCKET,
		coverLetterPath,
		coverLetterBuffer,
	)
	if (!coverLetterUpload.ok)
		return errFrom(
			`Failed to upload cover letter: ${coverLetterUpload.error.message}`,
		)

	// Update application record with document paths
	const appUpdate = updateApplication({
		id: input.applicationId,
		resumePath,
		coverLetterPath,
	})
	if (!appUpdate.ok)
		return errFrom(
			`Failed to update application: ${appUpdate.error.message}`,
		)

	return ok({ resumePath, coverLetterPath })
}
