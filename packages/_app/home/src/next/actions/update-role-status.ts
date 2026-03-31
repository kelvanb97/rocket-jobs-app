"use server"

import { updateRole } from "@rja-api/role/api/update-role"
import { roleStatusSchema } from "@rja-api/role/schema/role-schema"
import { actionClient, SafeForClientError } from "@rja-core/next-safe-action"
import { z } from "zod"

const updateRoleStatusSchema = z.object({
	id: z.number(),
	status: roleStatusSchema,
})

export const updateRoleStatusAction = actionClient
	.inputSchema(updateRoleStatusSchema)
	.action(async ({ parsedInput }) => {
		const result = updateRole(parsedInput)
		if (!result.ok) {
			throw new SafeForClientError(result.error.message)
		}
		return result.data
	})
