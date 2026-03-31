import { createMessage } from "@rja-integrations/anthropic/client"
import type { TAnthropicModel } from "@rja-integrations/anthropic/client"
import { z } from "zod"

const scoreResponseSchema = z.object({
	score: z.number().min(0).max(100),
	isTitleFit: z.boolean(),
	isSeniorityAppropriate: z.boolean(),
	doSkillsAlign: z.boolean(),
	isLocationAcceptable: z.boolean(),
	isSalaryAcceptable: z.boolean(),
	positive: z.array(z.string()),
	negative: z.array(z.string()),
})

export type TScoreResponse = z.infer<typeof scoreResponseSchema>

export async function scoreRole(
	model: TAnthropicModel,
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
