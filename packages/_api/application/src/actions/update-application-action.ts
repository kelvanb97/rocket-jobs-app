"use server"

import {
	actionClient,
	UnknownServerError,
} from "@aja-core/next-safe-action"
import { updateApplicationSchema } from "#schema/application-schema"
import { updateApplication } from "#api/update-application"

export const updateApplicationAction = actionClient
	.inputSchema(updateApplicationSchema)
	.action(async ({ parsedInput }) => {
		const result = await updateApplication(parsedInput)
		if (!result.ok)
			throw new UnknownServerError("updateApplicationAction", result.error)
		return { success: true, application: result.data }
	})
