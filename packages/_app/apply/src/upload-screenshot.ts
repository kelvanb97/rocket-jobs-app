import { readFileSync } from "node:fs"
import { updateApplication } from "@rja-api/application/api/update-application"
import { getRole } from "@rja-api/role/api/get-role"
import { uploadFile } from "@rja-api/storage/api/upload-file"
import { errFrom, ok, type TResult } from "@rja-core/result"

const STORAGE_BUCKET = "applications"

function sanitize(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)/g, "")
		.slice(0, 60)
}

type TUploadScreenshotInput = {
	roleId: number
	applicationId: number
	localPath: string
}

export async function uploadScreenshot(
	input: TUploadScreenshotInput,
): Promise<TResult<{ screenshotUrl: string }>> {
	const roleResult = getRole(input.roleId)
	if (!roleResult.ok)
		return errFrom(`Failed to fetch role: ${roleResult.error.message}`)

	const roleSlug = sanitize(roleResult.data.title)
	const timestamp = new Date()
		.toISOString()
		.replace(/[:.]/g, "-")
		.slice(0, 19)
	const storagePath = `${input.roleId}/${timestamp}-${roleSlug}-screenshot.png`

	const buffer = readFileSync(input.localPath)

	const upload = await uploadFile(STORAGE_BUCKET, storagePath, buffer)
	if (!upload.ok)
		return errFrom(`Failed to upload screenshot: ${upload.error.message}`)

	const updateResult = updateApplication({
		id: input.applicationId,
		screenshotPath: storagePath,
	})
	if (!updateResult.ok)
		return errFrom(
			`Failed to update application: ${updateResult.error.message}`,
		)

	return ok({ screenshotUrl: storagePath })
}
