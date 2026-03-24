import { createMessage as createAnthropicMessage } from "@aja-integrations/anthropic/client"
import { createMessage as createOllamaMessage } from "@aja-integrations/ollama/client"
import { z } from "zod"

const envSchema = z.object({
	LLM_PROVIDER: z.enum(["anthropic", "ollama"]).default("anthropic"),
})

export type TLLMModel = string

type TCreateMessageParams<T> = {
	model: TLLMModel
	system: string
	user: string
	maxTokens?: number
	schema: z.ZodType<T>
}

export async function createMessage<T>(
	params: TCreateMessageParams<T>,
): Promise<T> {
	const env = envSchema.parse(process.env)

	if (env.LLM_PROVIDER === "ollama") {
		return createOllamaMessage(params)
	}

	// Fallback to anthropic
	return createAnthropicMessage(params as any)
}
