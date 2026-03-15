"use server"

import {
	actionClient,
	UnknownServerError,
} from "@aja-core/next-safe-action"
import { createApplicationSchema } from "#schema/application-schema"
import { createApplication } from "#api/create-application"

export const createApplicationAction = actionClient
	.inputSchema(createApplicationSchema)
	.action(async ({ parsedInput }) => {
		const result = await createApplication(parsedInput)
		if (!result.ok)
			throw new UnknownServerError("createApplicationAction", result.error)
		return { success: true, application: result.data }
	})
