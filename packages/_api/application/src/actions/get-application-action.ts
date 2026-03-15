"use server"

import {
	actionClient,
	UnknownServerError,
} from "@aja-core/next-safe-action"
import { getApplicationSchema } from "#schema/application-schema"
import { getApplication } from "#api/get-application"

export const getApplicationAction = actionClient
	.inputSchema(getApplicationSchema)
	.action(async ({ parsedInput }) => {
		const result = await getApplication(parsedInput.id)
		if (!result.ok)
			throw new UnknownServerError("getApplicationAction", result.error)
		return { success: true, application: result.data }
	})
