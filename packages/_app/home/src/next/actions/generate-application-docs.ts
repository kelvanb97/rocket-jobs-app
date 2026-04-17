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
import { getUserProfile } from "@rja-api/settings/api/get-user-profile"
import { uploadFile } from "@rja-api/storage/api/upload-file"
import { actionClient, SafeForClientError } from "@rja-core/next-safe-action"
import { z } from "zod"
import { getOrCreateApplication } from "./role-application"

const STORAGE_BUCKET = "applications"

function cleanDisplayName(name: string): string {
	const cleaned = name.replace(/[\\/:*?"<>|]/g, "").trim()
	return cleaned || "Applicant"
}

const generateApplicationDocsSchema = z.object({
	roleId: z.number(),
})

export const generateApplicationDocsAction = actionClient
	.inputSchema(generateApplicationDocsSchema)
	.action(async ({ parsedInput }) => {
		const { roleId } = parsedInput

		// Fetch user profile
		const profileResult = getUserProfile()
		if (!profileResult.ok)
			throw new SafeForClientError(profileResult.error.message)
		const profile = profileResult.data

		// Fetch role
		const roleResult = getRole(roleId)
		if (!roleResult.ok)
			throw new SafeForClientError(roleResult.error.message)
		const role = roleResult.data

		// Fetch company
		const companyResult = role.companyId ? getCompany(role.companyId) : null
		const company =
			companyResult && companyResult.ok ? companyResult.data : null

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
		const resumeBuffer = await buildResumeDocx(
			profile.name,
			resumeContent,
			{
				email: profile.email,
				phone: profile.phone,
				links: profile.links,
				location: profile.location,
			},
		)

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
		const resumePath = `${roleId}/${displayName} Resume.docx`
		const coverLetterPath = `${roleId}/${displayName} Cover Letter.docx`

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
