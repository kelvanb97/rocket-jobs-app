import { createMessage } from "@aja-integrations/llm/client"
import type { TLLMModel } from "@aja-integrations/llm/client"
import { coverLetterResponseSchema } from "#schema/cover-letter-schema"
import type { TCoverLetterResponse } from "#schema/cover-letter-schema"

export async function generateCoverLetterContent(
	model: TLLMModel,
	system: string,
	user: string,
): Promise<TCoverLetterResponse> {
	return createMessage({
		model,
		system,
		user,
		maxTokens: 2048,
		schema: coverLetterResponseSchema as any,
	})
}
