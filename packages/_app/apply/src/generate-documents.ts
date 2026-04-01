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
import type { TAnthropicModel } from "@rja-integrations/anthropic/client"
import type { TGenerateDocumentsResult } from "./types"

const KEYWORD_MODEL = (process.env["APPLY_KEYWORD_MODEL"] ??
	"claude-haiku-4-5-20251001") as TAnthropicModel
const RESUME_MODEL = (process.env["APPLY_RESUME_MODEL"] ??
	"claude-opus-4-6") as TAnthropicModel
const STORAGE_BUCKET = "applications"

function sanitize(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)/g, "")
		.slice(0, 60)
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
	const companyName = company?.name ?? "Unknown Company"

	// Extract keywords
	const keywordPrompt = buildKeywordPrompt(role, company)
	const keywords = await extractKeywords(
		KEYWORD_MODEL,
		keywordPrompt.system,
		keywordPrompt.user,
	)

	// Generate resume
	const resumePrompt = buildResumePrompt(role, company, profile, keywords)
	const resumeContent = await generateResumeContent(
		RESUME_MODEL,
		resumePrompt.system,
		resumePrompt.user,
	)
	const resumeBuffer = await buildResumeDocx(profile.name, resumeContent, {
		email: profile.email,
		phone: profile.phone,
		linkedIn: profile.linkedin,
		github: profile.github,
		personalWebsite: profile.personalWebsite,
		location: profile.location,
	})

	// Generate cover letter
	const coverLetterPrompt = buildCoverLetterPrompt(role, company, profile)
	const coverLetterContent = await generateCoverLetterContent(
		RESUME_MODEL,
		coverLetterPrompt.system,
		coverLetterPrompt.user,
	)
	const coverLetterBuffer = await buildCoverLetterDocx(
		profile.name,
		coverLetterContent,
		{
			email: profile.email,
			phone: profile.phone,
			linkedIn: profile.linkedin,
			github: profile.github,
			personalWebsite: profile.personalWebsite,
			location: profile.location,
		},
	)

	// Upload documents
	const slug = sanitize(`${companyName}-${role.title}`)
	const timestamp = new Date()
		.toISOString()
		.replace(/[:.]/g, "-")
		.slice(0, 19)
	const resumePath = `${role.id}/${timestamp}-${slug}-resume.docx`
	const coverLetterPath = `${role.id}/${timestamp}-${slug}-cover-letter.docx`

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
