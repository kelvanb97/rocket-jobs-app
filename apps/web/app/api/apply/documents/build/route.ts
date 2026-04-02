import { createApplication } from "@rja-api/application/api/create-application"
import { listApplications } from "@rja-api/application/api/list-applications"
import { updateApplication } from "@rja-api/application/api/update-application"
import { getCompany } from "@rja-api/company/api/get-company"
import { buildCoverLetterDocx } from "@rja-api/cover-letter/api/build-cover-letter-docx"
import { coverLetterResponseSchema } from "@rja-api/cover-letter/schema/cover-letter-schema"
import { buildResumeDocx } from "@rja-api/resume/api/build-resume-docx"
import { resumeResponseSchema } from "@rja-api/resume/schema/resume-schema"
import { getRole } from "@rja-api/role/api/get-role"
import { getUserProfile } from "@rja-api/settings/api/get-user-profile"
import { uploadFile } from "@rja-api/storage/api/upload-file"
import { NextResponse } from "next/server"
import { z } from "zod"

export const maxDuration = 180

const buildRequestSchema = z.object({
	roleId: z.number(),
	resume: resumeResponseSchema,
	coverLetter: coverLetterResponseSchema,
})

function sanitize(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)/g, "")
		.slice(0, 60)
}

export async function POST(request: Request) {
	try {
		const body = await request.json()
		const { roleId, resume, coverLetter } = buildRequestSchema.parse(body)

		// Fetch role + company for slug
		const roleResult = getRole(roleId)
		if (!roleResult.ok) {
			return NextResponse.json(
				{ error: roleResult.error.message },
				{ status: 404 },
			)
		}
		const role = roleResult.data

		let companyName = "Unknown Company"
		if (role.companyId) {
			const companyResult = getCompany(role.companyId)
			if (companyResult.ok) companyName = companyResult.data.name
		}

		// Fetch user profile for contact info
		const profileResult = getUserProfile()
		if (!profileResult.ok) {
			return NextResponse.json(
				{ error: profileResult.error.message },
				{ status: 500 },
			)
		}
		const profile = profileResult.data
		const contactInfo = {
			email: profile.email,
			phone: profile.phone,
			linkedIn: profile.linkedin,
			github: profile.github,
			personalWebsite: profile.personalWebsite,
			location: profile.location,
		}

		// Build DOCX files
		const resumeBuffer = await buildResumeDocx(
			profile.name,
			resume,
			contactInfo,
		)
		const coverLetterBuffer = await buildCoverLetterDocx(
			profile.name,
			coverLetter,
			contactInfo,
		)

		// Upload files
		const slug = sanitize(`${companyName}-${role.title}`)
		const timestamp = new Date()
			.toISOString()
			.replace(/[:.]/g, "-")
			.slice(0, 19)
		const resumePath = `${roleId}/${timestamp}-${slug}-resume.docx`
		const coverLetterPath = `${roleId}/${timestamp}-${slug}-cover-letter.docx`

		const resumeUpload = await uploadFile(
			"applications",
			resumePath,
			resumeBuffer,
		)
		if (!resumeUpload.ok) {
			return NextResponse.json(
				{ error: resumeUpload.error.message },
				{ status: 500 },
			)
		}

		const coverLetterUpload = await uploadFile(
			"applications",
			coverLetterPath,
			coverLetterBuffer,
		)
		if (!coverLetterUpload.ok) {
			return NextResponse.json(
				{ error: coverLetterUpload.error.message },
				{ status: 500 },
			)
		}

		// Get or create application
		const listResult = listApplications({ roleId, page: 1, pageSize: 1 })
		if (!listResult.ok) {
			return NextResponse.json(
				{ error: listResult.error.message },
				{ status: 500 },
			)
		}

		let application = listResult.data.applications[0]
		if (!application) {
			const createResult = createApplication({ roleId })
			if (!createResult.ok) {
				return NextResponse.json(
					{ error: createResult.error.message },
					{ status: 500 },
				)
			}
			application = createResult.data
		}

		// Update with file paths
		const updateResult = updateApplication({
			id: application.id,
			resumePath,
			coverLetterPath,
		})
		if (!updateResult.ok) {
			return NextResponse.json(
				{ error: updateResult.error.message },
				{ status: 500 },
			)
		}

		return NextResponse.json({
			data: {
				applicationId: application.id,
				resumePath,
				coverLetterPath,
			},
		})
	} catch (err) {
		if (err instanceof Error && err.name === "ZodError") {
			return NextResponse.json(
				{ error: "Validation failed", details: err },
				{ status: 400 },
			)
		}
		const message = err instanceof Error ? err.message : String(err)
		return NextResponse.json({ error: message }, { status: 500 })
	}
}
