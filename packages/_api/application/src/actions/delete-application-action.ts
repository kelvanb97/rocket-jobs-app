"use server"

import {
	actionClient,
	UnknownServerError,
} from "@aja-core/next-safe-action"
import { deleteApplicationSchema } from "#schema/application-schema"
import { deleteApplication } from "#api/delete-application"

export const deleteApplicationAction = actionClient
	.inputSchema(deleteApplicationSchema)
	.action(async ({ parsedInput }) => {
		const result = await deleteApplication(parsedInput.id)
		if (!result.ok)
			throw new UnknownServerError("deleteApplicationAction", result.error)
		return { success: true, id: parsedInput.id }
	})
