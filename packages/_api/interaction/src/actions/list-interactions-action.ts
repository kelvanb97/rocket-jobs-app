"use server"

import {
	actionClient,
	UnknownServerError,
} from "@aja-core/next-safe-action"
import { listInteractionsSchema } from "#schema/interaction-schema"
import { listInteractions } from "#api/list-interactions"

export const listInteractionsAction = actionClient
	.inputSchema(listInteractionsSchema)
	.action(async ({ parsedInput }) => {
		const result = await listInteractions(parsedInput)
		if (!result.ok)
			throw new UnknownServerError("listInteractionsAction", result.error)
		return {
			success: true,
			interactions: result.data.interactions,
			page: parsedInput.page,
			pageSize: parsedInput.pageSize,
			hasNext: result.data.hasNext,
		}
	})
