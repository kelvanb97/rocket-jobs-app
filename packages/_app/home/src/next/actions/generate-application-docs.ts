"use server"

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
import { uploadFile } from "@rja-api/storage/api/upload-file"
import { USER_PROFILE } from "@rja-config/user/experience"
import { actionClient, SafeForClientError } from "@rja-core/next-safe-action"
import { z } from "zod"
import { getOrCreateApplication } from "./role-application"

const KEYWORD_MODEL = "claude-haiku-4-5-20251001" as const
const RESUME_MODEL = "claude-opus-4-6" as const
const STORAGE_BUCKET = "applications"

function sanitize(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)/g, "")
		.slice(0, 60)
}

const generateApplicationDocsSchema = z.object({
	roleId: z.number(),
})

export const generateApplicationDocsAction = actionClient
	.inputSchema(generateApplicationDocsSchema)
	.action(async ({ parsedInput }) => {
		const { roleId } = parsedInput

		// Fetch role
		const roleResult = getRole(roleId)
		if (!roleResult.ok)
			throw new SafeForClientError(roleResult.error.message)
		const role = roleResult.data

		// Fetch company
		const companyResult = role.companyId ? getCompany(role.companyId) : null
		const company =
			companyResult && companyResult.ok ? companyResult.data : null
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
		const resumePath = `${roleId}/${timestamp}-${slug}-resume.docx`
		const coverLetterPath = `${roleId}/${timestamp}-${slug}-cover-letter.docx`

		const resumeUpload = await uploadFile(
			STORAGE_BUCKET,
			resumePath,
			resumeBuffer,
		)
		if (!resumeUpload.ok)
			throw new SafeForClientError(resumeUpload.error.message)

		const coverLetterUpload = await uploadFile(
			STORAGE_BUCKET,
			coverLetterPath,
			coverLetterBuffer,
		)
		if (!coverLetterUpload.ok)
			throw new SafeForClientError(coverLetterUpload.error.message)

		// Get or create application and update with paths
		const application = await getOrCreateApplication(roleId)
		const updateResult = updateApplication({
			id: application.id,
			resumePath,
			coverLetterPath,
		})
		if (!updateResult.ok)
			throw new SafeForClientError(updateResult.error.message)

		return updateResult.data
	})
