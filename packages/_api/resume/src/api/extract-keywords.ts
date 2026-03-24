import { createMessage } from "@aja-integrations/llm/client"
import type { TLLMModel } from "@aja-integrations/llm/client"
import { keywordExtractionSchema } from "#schema/keyword-schema"
import type { TKeywordExtraction } from "#schema/keyword-schema"

export async function extractKeywords(
	model: TLLMModel,
	system: string,
	user: string,
): Promise<TKeywordExtraction> {
	return createMessage({
		model,
		system,
		user,
		maxTokens: 1024,
		schema: keywordExtractionSchema,
	})
}
