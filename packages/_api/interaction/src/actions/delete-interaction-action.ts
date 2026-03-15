"use server"

import {
	actionClient,
	UnknownServerError,
} from "@aja-core/next-safe-action"
import { deleteInteractionSchema } from "#schema/interaction-schema"
import { deleteInteraction } from "#api/delete-interaction"

export const deleteInteractionAction = actionClient
	.inputSchema(deleteInteractionSchema)
	.action(async ({ parsedInput }) => {
		const result = await deleteInteraction(parsedInput.id)
		if (!result.ok)
			throw new UnknownServerError("deleteInteractionAction", result.error)
		return { success: true, id: parsedInput.id }
	})
