"use server"

import {
	actionClient,
	UnknownServerError,
} from "@aja-core/next-safe-action"
import { getInteractionSchema } from "#schema/interaction-schema"
import { getInteraction } from "#api/get-interaction"

export const getInteractionAction = actionClient
	.inputSchema(getInteractionSchema)
	.action(async ({ parsedInput }) => {
		const result = await getInteraction(parsedInput.id)
		if (!result.ok)
			throw new UnknownServerError("getInteractionAction", result.error)
		return { success: true, interaction: result.data }
	})
