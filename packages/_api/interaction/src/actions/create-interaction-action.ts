"use server"

import {
	actionClient,
	UnknownServerError,
} from "@aja-core/next-safe-action"
import { createInteractionSchema } from "#schema/interaction-schema"
import { createInteraction } from "#api/create-interaction"

export const createInteractionAction = actionClient
	.inputSchema(createInteractionSchema)
	.action(async ({ parsedInput }) => {
		const result = await createInteraction(parsedInput)
		if (!result.ok)
			throw new UnknownServerError("createInteractionAction", result.error)
		return { success: true, interaction: result.data }
	})
