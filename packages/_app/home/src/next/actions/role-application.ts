"use server"

import { createApplication } from "@aja-api/application/api/create-application"
import { listApplications } from "@aja-api/application/api/list-applications"
import { updateApplication } from "@aja-api/application/api/update-application"
import type { TApplication } from "@aja-api/application/schema/application-schema"
import { getPublicUrl } from "@aja-api/storage/api/get-public-url"
import { listFiles } from "@aja-api/storage/api/list-files"
import { removeFiles } from "@aja-api/storage/api/remove-files"
import { uploadFile } from "@aja-api/storage/api/upload-file"
import { actionClient, SafeForClientError } from "@aja-core/next-safe-action"
import { z } from "zod"

const BUCKET = "applications"

function storageUrl(path: string | null): string | null {
	if (!path) return null
	if (path.startsWith("http")) return path
	const result = getPublicUrl(BUCKET, path)
	return result.ok ? result.data : null
}

export const getRoleApplicationAction = actionClient
	.inputSchema(z.object({ roleId: z.string() }))
	.action(async ({ parsedInput }) => {
		const result = await listApplications({
			roleId: parsedInput.roleId,
			page: 1,
			pageSize: 1,
		})
		if (!result.ok) {
			throw new SafeForClientError(result.error.message)
		}
		const app = result.data.applications[0] ?? null
		if (!app) return null
		return {
			...app,
			resumePath: storageUrl(app.resumePath),
			coverLetterPath: storageUrl(app.coverLetterPath),
			screenshotPath: storageUrl(app.screenshotPath),
		}
	})

export const saveRoleApplicationAction = actionClient
	.inputSchema(
		z.object({
			id: z.string().optional(),
			roleId: z.string(),
			notes: z.string().nullable().optional(),
		}),
	)
	.action(async ({ parsedInput }) => {
		if (parsedInput.id) {
			const result = await updateApplication({
				id: parsedInput.id,
				notes: parsedInput.notes,
			})
			if (!result.ok) {
				throw new SafeForClientError(result.error.message)
			}
			return result.data
		}

		const result = await createApplication({
			roleId: parsedInput.roleId,
			notes: parsedInput.notes,
		})
		if (!result.ok) {
			throw new SafeForClientError(result.error.message)
		}
		return result.data
	})

export async function getOrCreateApplication(
	roleId: string,
): Promise<TApplication> {
	const listResult = await listApplications({
		roleId,
		page: 1,
		pageSize: 1,
	})
	if (!listResult.ok) {
		throw new Error(listResult.error.message)
	}
	if (listResult.data.applications[0]) {
		return listResult.data.applications[0]
	}

	const createResult = await createApplication({ roleId })
	if (!createResult.ok) {
		throw new Error(createResult.error.message)
	}
	return createResult.data
}

function getExtension(filename: string): string {
	const dot = filename.lastIndexOf(".")
	return dot >= 0 ? filename.slice(dot) : ""
}

export async function uploadApplicationFile(
	formData: FormData,
): Promise<{ url: string; application: TApplication }> {
	const roleId = formData.get("roleId") as string
	const fileType = formData.get("fileType") as "resume" | "cover_letter"
	const file = formData.get("file") as File

	if (!roleId || !fileType || !file) {
		throw new Error("Missing required fields")
	}

	const ext = getExtension(file.name) || ".pdf"
	const storagePath = `${roleId}/${fileType}${ext}`

	const uploadResult = await uploadFile(BUCKET, storagePath, file, {
		upsert: true,
	})

	if (!uploadResult.ok) {
		throw new Error(`Upload failed: ${uploadResult.error.message}`)
	}

	const application = await getOrCreateApplication(roleId)

	const updateFields =
		fileType === "resume"
			? { resumePath: storagePath }
			: { coverLetterPath: storagePath }

	const updateResult = await updateApplication({
		id: application.id,
		...updateFields,
	})
	if (!updateResult.ok) {
		throw new Error(updateResult.error.message)
	}

	return {
		url: storageUrl(storagePath) ?? storagePath,
		application: updateResult.data,
	}
}

export async function removeApplicationFile(
	roleId: string,
	applicationId: string,
	fileType: "resume" | "cover_letter",
): Promise<TApplication> {
	const listResult = await listFiles(BUCKET, roleId, { search: fileType })

	if (listResult.ok && listResult.data.length > 0) {
		const paths = listResult.data
			.filter((f) => f.name.startsWith(fileType))
			.map((f) => `${roleId}/${f.name}`)
		if (paths.length > 0) {
			await removeFiles(BUCKET, paths)
		}
	}

	const updateFields =
		fileType === "resume" ? { resumePath: null } : { coverLetterPath: null }

	const updateResult = await updateApplication({
		id: applicationId,
		...updateFields,
	})
	if (!updateResult.ok) {
		throw new Error(updateResult.error.message)
	}

	return updateResult.data
}
