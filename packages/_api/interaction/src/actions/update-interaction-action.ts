"use server"

import {
	actionClient,
	UnknownServerError,
} from "@aja-core/next-safe-action"
import { updateInteractionSchema } from "#schema/interaction-schema"
import { updateInteraction } from "#api/update-interaction"

export const updateInteractionAction = actionClient
	.inputSchema(updateInteractionSchema)
	.action(async ({ parsedInput }) => {
		const result = await updateInteraction(parsedInput)
		if (!result.ok)
			throw new UnknownServerError("updateInteractionAction", result.error)
		return { success: true, interaction: result.data }
	})
