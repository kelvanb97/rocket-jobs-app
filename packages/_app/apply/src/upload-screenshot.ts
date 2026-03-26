import { readFileSync } from "node:fs"
import { updateApplication } from "@aja-api/application/api/update-application"
import { getRole } from "@aja-api/role/api/get-role"
import { getPublicUrl } from "@aja-api/storage/api/get-public-url"
import { uploadFile } from "@aja-api/storage/api/upload-file"
import { errFrom, ok, type TResult } from "@aja-core/result"

const STORAGE_BUCKET = "applications"

function sanitize(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)/g, "")
		.slice(0, 60)
}

type TUploadScreenshotInput = {
	roleId: string
	applicationId: string
	localPath: string
}

export async function uploadScreenshot(
	input: TUploadScreenshotInput,
): Promise<TResult<{ screenshotUrl: string }>> {
	const roleResult = await getRole(input.roleId)
	if (!roleResult.ok)
		return errFrom(`Failed to fetch role: ${roleResult.error.message}`)

	const roleSlug = sanitize(roleResult.data.title)
	const timestamp = new Date()
		.toISOString()
		.replace(/[:.]/g, "-")
		.slice(0, 19)
	const storagePath = `${input.roleId}/${timestamp}-${roleSlug}-screenshot.png`

	const buffer = readFileSync(input.localPath)

	const upload = await uploadFile(STORAGE_BUCKET, storagePath, buffer, {
		contentType: "image/png",
		upsert: true,
	})
	if (!upload.ok)
		return errFrom(`Failed to upload screenshot: ${upload.error.message}`)

	const urlResult = getPublicUrl(STORAGE_BUCKET, storagePath)
	if (!urlResult.ok)
		return errFrom(`Failed to get public URL: ${urlResult.error.message}`)

	const updateResult = await updateApplication({
		id: input.applicationId,
		screenshotPath: urlResult.data,
	})
	if (!updateResult.ok)
		return errFrom(
			`Failed to update application: ${updateResult.error.message}`,
		)

	return ok({ screenshotUrl: urlResult.data })
}
