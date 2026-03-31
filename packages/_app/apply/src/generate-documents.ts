import { updateApplication } from "@aja-api/application/api/update-application"
import { getCompany } from "@aja-api/company/api/get-company"
import { buildCoverLetterDocx } from "@aja-api/cover-letter/api/build-cover-letter-docx"
import { buildCoverLetterPrompt } from "@aja-api/cover-letter/api/build-cover-letter-prompt"
import { generateCoverLetterContent } from "@aja-api/cover-letter/api/generate-cover-letter"
import { buildKeywordPrompt } from "@aja-api/resume/api/build-keyword-prompt"
import { buildResumeDocx } from "@aja-api/resume/api/build-resume-docx"
import { buildResumePrompt } from "@aja-api/resume/api/build-resume-prompt"
import { extractKeywords } from "@aja-api/resume/api/extract-keywords"
import { generateResumeContent } from "@aja-api/resume/api/generate-resume"
import { getRole } from "@aja-api/role/api/get-role"
import { uploadFile } from "@aja-api/storage/api/upload-file"
import { USER_PROFILE } from "@aja-config/user/experience"
import { errFrom, ok, type TResult } from "@aja-core/result"
import type { TAnthropicModel } from "@aja-integrations/anthropic/client"
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
	const resumePrompt = buildResumePrompt(
		role,
		company,
		USER_PROFILE,
		keywords,
	)
	const resumeContent = await generateResumeContent(
		RESUME_MODEL,
		resumePrompt.system,
		resumePrompt.user,
	)
	const resumeBuffer = await buildResumeDocx(
		USER_PROFILE.name,
		resumeContent,
		{
			email: USER_PROFILE.email,
			phone: USER_PROFILE.phone,
			linkedIn: USER_PROFILE.linkedIn,
			github: USER_PROFILE.github,
			personalWebsite: USER_PROFILE.personalWebsite,
			location: USER_PROFILE.location,
		},
	)

	// Generate cover letter
	const coverLetterPrompt = buildCoverLetterPrompt(
		role,
		company,
		USER_PROFILE,
	)
	const coverLetterContent = await generateCoverLetterContent(
		RESUME_MODEL,
		coverLetterPrompt.system,
		coverLetterPrompt.user,
	)
	const coverLetterBuffer = await buildCoverLetterDocx(
		USER_PROFILE.name,
		coverLetterContent,
		{
			email: USER_PROFILE.email,
			phone: USER_PROFILE.phone,
			linkedIn: USER_PROFILE.linkedIn,
			github: USER_PROFILE.github,
			personalWebsite: USER_PROFILE.personalWebsite,
			location: USER_PROFILE.location,
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
