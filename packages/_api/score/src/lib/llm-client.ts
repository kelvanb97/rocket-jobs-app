import { createMessage } from "@aja-integrations/llm/client"
import type { TLLMModel } from "@aja-integrations/llm/client"
import { z } from "zod"

const scoreResponseSchema = z.object({
	score: z.number().min(0).max(100),
	positive: z.array(z.string()),
	negative: z.array(z.string()),
})

export type TScoreResponse = z.infer<typeof scoreResponseSchema>

export async function scoreRole(
	model: TLLMModel,
	system: string,
	user: string,
): Promise<TScoreResponse> {
	return createMessage({
		model,
		system,
		user,
		schema: scoreResponseSchema,
	})
}
