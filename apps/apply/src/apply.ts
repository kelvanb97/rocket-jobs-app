import { createApplication } from "@aja-api/application/api/create-application"
import { getCompany } from "@aja-api/company/api/get-company"
import { buildCoverLetterDocx } from "@aja-api/cover-letter/api/build-cover-letter-docx"
import { buildCoverLetterPrompt } from "@aja-api/cover-letter/api/build-cover-letter-prompt"
import { generateCoverLetterContent } from "@aja-api/cover-letter/api/generate-cover-letter"
import { buildKeywordPrompt } from "@aja-api/resume/api/build-keyword-prompt"
import { buildResumeDocx } from "@aja-api/resume/api/build-resume-docx"
import { buildResumePrompt } from "@aja-api/resume/api/build-resume-prompt"
import { extractKeywords } from "@aja-api/resume/api/extract-keywords"
import { generateResumeContent } from "@aja-api/resume/api/generate-resume"
import { getTopUnappliedRole } from "@aja-api/role/api/get-top-unapplied-role"
import { updateRole } from "@aja-api/role/api/update-role"
import { USER_PROFILE } from "@aja-config/user/experience"
import type { TAnthropicModel } from "@aja-integrations/anthropic/client"
import { uploadDocument } from "./lib/upload"

const KEYWORD_MODEL = (process.env["APPLY_KEYWORD_MODEL"] ??
	"claude-haiku-4-5-20251001") as TAnthropicModel
const RESUME_MODEL = (process.env["APPLY_RESUME_MODEL"] ??
	"claude-opus-4-6-20250619") as TAnthropicModel
const STORAGE_BUCKET = "applications"

function sanitize(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)/g, "")
		.slice(0, 60)
}

export async function runApply(): Promise<void> {
	// 1. Find the highest-scoring unapplied role
	console.log("[apply] Finding top unapplied role...")
	const roleResult = await getTopUnappliedRole()
	if (!roleResult.ok) {
		throw new Error(roleResult.error.message)
	}

	const roleWithScore = roleResult.data
	if (!roleWithScore) {
		console.log("[apply] No unapplied roles with scores found.")
		return
	}

	const { score, ...role } = roleWithScore

	// Fetch company if available
	const company = role.companyId
		? await getCompany(role.companyId).then((r) => (r.ok ? r.data : null))
		: null

	const companyName = company?.name ?? "Unknown Company"
	console.log(
		`[apply] Selected: "${role.title}" at ${companyName} (score: ${score})`,
	)

	// 2. Extract keywords from JD
	console.log("[apply] Extracting keywords...")
	const keywordPrompt = buildKeywordPrompt(role, company)
	const keywords = await extractKeywords(
		KEYWORD_MODEL,
		keywordPrompt.system,
		keywordPrompt.user,
	)
	console.log(
		`[apply] Keywords extracted: ${keywords.requiredSkills.length} required, ${keywords.preferredSkills.length} preferred skills.`,
	)

	// 3. Generate tailored resume
	console.log("[apply] Generating resume...")
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
			location: USER_PROFILE.location,
		},
	)
	console.log("[apply] Resume generated.")

	// 4. Generate tailored cover letter
	console.log("[apply] Generating cover letter...")
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
	)
	console.log("[apply] Cover letter generated.")

	// 5. Upload documents to Supabase Storage
	const slug = sanitize(`${companyName}-${role.title}`)
	const timestamp = new Date().toISOString().slice(0, 10)
	const resumePath = `${role.id}/${timestamp}-${slug}-resume.docx`
	const coverLetterPath = `${role.id}/${timestamp}-${slug}-cover-letter.docx`

	console.log("[apply] Uploading resume...")
	const resumeUpload = await uploadDocument(
		STORAGE_BUCKET,
		resumePath,
		resumeBuffer,
	)
	if (!resumeUpload.ok) throw new Error(resumeUpload.error.message)

	console.log("[apply] Uploading cover letter...")
	const coverLetterUpload = await uploadDocument(
		STORAGE_BUCKET,
		coverLetterPath,
		coverLetterBuffer,
	)
	if (!coverLetterUpload.ok) throw new Error(coverLetterUpload.error.message)

	// 6. Create application record
	console.log("[apply] Creating application record...")
	const appResult = await createApplication({
		roleId: role.id,
		status: "draft",
		resumePath,
		coverLetterPath,
		notes: `Auto-generated for "${role.title}" at ${companyName} (score: ${score})`,
	})
	if (!appResult.ok) throw new Error(appResult.error.message)

	// 7. Update role status to "applied"
	console.log("[apply] Updating role status...")
	const roleUpdate = await updateRole({ id: role.id, status: "applied" })
	if (!roleUpdate.ok) throw new Error(roleUpdate.error.message)

	// 8. Log summary
	console.log("\n[apply] Application staged successfully!")
	console.log(`  Role:          ${role.title}`)
	console.log(`  Company:       ${companyName}`)
	console.log(`  Score:         ${score}`)
	console.log(`  Resume:        ${resumePath}`)
	console.log(`  Cover Letter:  ${coverLetterPath}`)
	console.log(`  Application:   ${appResult.data.id}`)
}
