"use server"

import { createApplication } from "@rja-api/application/api/create-application"
import { listApplications } from "@rja-api/application/api/list-applications"
import { updateApplication } from "@rja-api/application/api/update-application"
import type { TApplication } from "@rja-api/application/schema/application-schema"
import { getPublicUrl } from "@rja-api/storage/api/get-public-url"
import { listFiles } from "@rja-api/storage/api/list-files"
import { removeFiles } from "@rja-api/storage/api/remove-files"
import { uploadFile } from "@rja-api/storage/api/upload-file"
import { actionClient, SafeForClientError } from "@rja-core/next-safe-action"
import { z } from "zod"

const BUCKET = "applications"

function storageUrl(path: string | null): string | null {
	if (!path) return null
	if (path.startsWith("http")) return path
	const result = getPublicUrl(BUCKET, path)
	return result.ok ? result.data : null
}

export const getRoleApplicationAction = actionClient
	.inputSchema(z.object({ roleId: z.number() }))
	.action(async ({ parsedInput }) => {
		const result = listApplications({
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
			id: z.number().optional(),
			roleId: z.number(),
			notes: z.string().nullable().optional(),
		}),
	)
	.action(async ({ parsedInput }) => {
		if (parsedInput.id) {
			const result = updateApplication({
				id: parsedInput.id,
				notes: parsedInput.notes,
			})
			if (!result.ok) {
				throw new SafeForClientError(result.error.message)
			}
			return result.data
		}

		const result = createApplication({
			roleId: parsedInput.roleId,
			notes: parsedInput.notes,
		})
		if (!result.ok) {
			throw new SafeForClientError(result.error.message)
		}
		return result.data
	})

export async function getOrCreateApplication(
	roleId: number,
): Promise<TApplication> {
	const listResult = listApplications({
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

	const createResult = createApplication({ roleId })
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
	const roleIdStr = formData.get("roleId") as string
	const fileType = formData.get("fileType") as "resume" | "cover_letter"
	const file = formData.get("file") as File

	if (!roleIdStr || !fileType || !file) {
		throw new Error("Missing required fields")
	}

	const roleId = Number(roleIdStr)
	const ext = getExtension(file.name) || ".pdf"
	const storagePath = `${roleId}/${fileType}${ext}`

	const uploadResult = await uploadFile(BUCKET, storagePath, file)

	if (!uploadResult.ok) {
		throw new Error(`Upload failed: ${uploadResult.error.message}`)
	}

	const application = await getOrCreateApplication(roleId)

	const updateFields =
		fileType === "resume"
			? { resumePath: storagePath }
			: { coverLetterPath: storagePath }

	const updateResult = updateApplication({
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
	roleId: number,
	applicationId: number,
	fileType: "resume" | "cover_letter",
): Promise<TApplication> {
	const listResult = listFiles(BUCKET, String(roleId), { search: fileType })

	if (listResult.ok && listResult.data.length > 0) {
		const paths = listResult.data
			.filter((f) => f.name.startsWith(fileType))
			.map((f) => `${roleId}/${f.name}`)
		if (paths.length > 0) {
			removeFiles(BUCKET, paths)
		}
	}

	const updateFields =
		fileType === "resume" ? { resumePath: null } : { coverLetterPath: null }

	const updateResult = updateApplication({
		id: applicationId,
		...updateFields,
	})
	if (!updateResult.ok) {
		throw new Error(updateResult.error.message)
	}

	return updateResult.data
}
