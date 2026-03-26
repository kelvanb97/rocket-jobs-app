"use server"

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
import { getPublicUrl } from "@aja-api/storage/api/get-public-url"
import { uploadFile } from "@aja-api/storage/api/upload-file"
import { USER_PROFILE } from "@aja-config/user/experience"
import { actionClient, SafeForClientError } from "@aja-core/next-safe-action"
import { z } from "zod"
import { getOrCreateApplication } from "./role-application"

const KEYWORD_MODEL = "claude-haiku-4-5-20251001" as const
const RESUME_MODEL = "claude-opus-4-6" as const
const STORAGE_BUCKET = "applications"
const DOCX_CONTENT_TYPE =
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document"

function sanitize(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)/g, "")
		.slice(0, 60)
}

const generateApplicationDocsSchema = z.object({
	roleId: z.string(),
})

export const generateApplicationDocsAction = actionClient
	.inputSchema(generateApplicationDocsSchema)
	.action(async ({ parsedInput }) => {
		const { roleId } = parsedInput

		// Fetch role
		const roleResult = await getRole(roleId)
		if (!roleResult.ok)
			throw new SafeForClientError(roleResult.error.message)
		const role = roleResult.data

		// Fetch company
		const company = role.companyId
			? await getCompany(role.companyId).then((r) =>
					r.ok ? r.data : null,
				)
			: null
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
		const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)
		const resumePath = `${roleId}/${timestamp}-${slug}-resume.docx`
		const coverLetterPath = `${roleId}/${timestamp}-${slug}-cover-letter.docx`

		const resumeUpload = await uploadFile(
			STORAGE_BUCKET,
			resumePath,
			resumeBuffer,
			{ contentType: DOCX_CONTENT_TYPE, upsert: true },
		)
		if (!resumeUpload.ok)
			throw new SafeForClientError(resumeUpload.error.message)

		const coverLetterUpload = await uploadFile(
			STORAGE_BUCKET,
			coverLetterPath,
			coverLetterBuffer,
			{ contentType: DOCX_CONTENT_TYPE, upsert: true },
		)
		if (!coverLetterUpload.ok)
			throw new SafeForClientError(coverLetterUpload.error.message)

		// Get public URLs
		const resumeUrlResult = getPublicUrl(STORAGE_BUCKET, resumePath)
		if (!resumeUrlResult.ok)
			throw new SafeForClientError(resumeUrlResult.error.message)

		const coverLetterUrlResult = getPublicUrl(
			STORAGE_BUCKET,
			coverLetterPath,
		)
		if (!coverLetterUrlResult.ok)
			throw new SafeForClientError(coverLetterUrlResult.error.message)

		// Get or create application and update with paths
		const application = await getOrCreateApplication(roleId)
		const updateResult = await updateApplication({
			id: application.id,
			resumePath: resumeUrlResult.data,
			coverLetterPath: coverLetterUrlResult.data,
		})
		if (!updateResult.ok)
			throw new SafeForClientError(updateResult.error.message)

		return updateResult.data
	})
