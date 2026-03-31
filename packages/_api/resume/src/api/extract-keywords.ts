import { createMessage } from "@rja-integrations/anthropic/client"
import type { TAnthropicModel } from "@rja-integrations/anthropic/client"
import { keywordExtractionSchema } from "#schema/keyword-schema"
import type { TKeywordExtraction } from "#schema/keyword-schema"

export async function extractKeywords(
	model: TAnthropicModel,
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
