import { createMessage } from "@aja-integrations/llm/client"
import type { TLLMModel } from "@aja-integrations/llm/client"
import { resumeResponseSchema } from "#schema/resume-schema"
import type { TResumeResponse } from "#schema/resume-schema"

export async function generateResumeContent(
	model: TLLMModel,
	system: string,
	user: string,
): Promise<TResumeResponse> {
	return createMessage({
		model,
		system,
		user,
		maxTokens: 4096,
		schema: resumeResponseSchema,
	})
}
