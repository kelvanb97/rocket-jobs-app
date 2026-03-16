"use server"

import type { TApplication } from "@aja-api/application/schema/application-schema"
import { createApplication } from "@aja-api/application/api/create-application"
import { listApplications } from "@aja-api/application/api/list-applications"
import { updateApplication } from "@aja-api/application/api/update-application"
import type { Database } from "@aja-app/supabase"
import { actionClient, SafeForClientError } from "@aja-core/next-safe-action"
import { supabaseAdminClient } from "@aja-core/supabase/admin"
import { z } from "zod"

const BUCKET = "applications"

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
		return result.data.applications[0] ?? null
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

async function getOrCreateApplication(
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

	const supabase = supabaseAdminClient<Database>()

	const { error: uploadError } = await supabase.storage
		.from(BUCKET)
		.upload(storagePath, file, { upsert: true })

	if (uploadError) {
		throw new Error(`Upload failed: ${uploadError.message}`)
	}

	const {
		data: { publicUrl },
	} = supabase.storage.from(BUCKET).getPublicUrl(storagePath)

	const application = await getOrCreateApplication(roleId)

	const updateFields =
		fileType === "resume"
			? { resumePath: publicUrl }
			: { coverLetterPath: publicUrl }

	const updateResult = await updateApplication({
		id: application.id,
		...updateFields,
	})
	if (!updateResult.ok) {
		throw new Error(updateResult.error.message)
	}

	return { url: publicUrl, application: updateResult.data }
}

export async function removeApplicationFile(
	roleId: string,
	applicationId: string,
	fileType: "resume" | "cover_letter",
): Promise<TApplication> {
	const supabase = supabaseAdminClient<Database>()

	// List files at the role's directory to find the exact filename
	const { data: files } = await supabase.storage
		.from(BUCKET)
		.list(roleId, { search: fileType })

	if (files && files.length > 0) {
		const paths = files
			.filter((f) => f.name.startsWith(fileType))
			.map((f) => `${roleId}/${f.name}`)
		if (paths.length > 0) {
			await supabase.storage.from(BUCKET).remove(paths)
		}
	}

	const updateFields =
		fileType === "resume"
			? { resumePath: null }
			: { coverLetterPath: null }

	const updateResult = await updateApplication({
		id: applicationId,
		...updateFields,
	})
	if (!updateResult.ok) {
		throw new Error(updateResult.error.message)
	}

	return updateResult.data
}
