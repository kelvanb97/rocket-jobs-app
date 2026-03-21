import { createMessage } from "@aja-integrations/anthropic/client"
import type { TAnthropicModel } from "@aja-integrations/anthropic/client"
import { resumeResponseSchema } from "#schema/resume-schema"
import type { TResumeResponse } from "#schema/resume-schema"

export async function generateResumeContent(
	model: TAnthropicModel,
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
