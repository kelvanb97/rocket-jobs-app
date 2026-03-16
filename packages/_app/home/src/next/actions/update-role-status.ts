"use server"

import { updateRole } from "@aja-api/role/api/update-role"
import { roleStatusSchema } from "@aja-api/role/schema/role-schema"
import { actionClient, SafeForClientError } from "@aja-core/next-safe-action"
import { z } from "zod"

const updateRoleStatusSchema = z.object({
	id: z.string(),
	status: roleStatusSchema,
})

export const updateRoleStatusAction = actionClient
	.inputSchema(updateRoleStatusSchema)
	.action(async ({ parsedInput }) => {
		const result = await updateRole(parsedInput)
		if (!result.ok) {
			throw new SafeForClientError(result.error.message)
		}
		return result.data
	})
