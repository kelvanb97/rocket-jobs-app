import Anthropic from "@anthropic-ai/sdk"
import type { z } from "zod"

export type TAnthropicModel = Anthropic.Messages.Model

const envSchema = await import("zod").then((m) =>
	m.z.object({
		ANTHROPIC_API_KEY: m.z.string().trim().min(1),
	}),
)

let _client: Anthropic | null = null

const getClient = (): Anthropic => {
	if (!_client) {
		const env = envSchema.parse(process.env)
		_client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })
	}
	return _client
}

type TCreateMessageParams<T> = {
	model: TAnthropicModel
	system: string
	user: string
	maxTokens?: number
	schema: z.ZodType<T>
}

export async function createMessage<T>(
	params: TCreateMessageParams<T>,
): Promise<T> {
	const client = getClient()

	const message = await client.messages.create({
		model: params.model,
		max_tokens: params.maxTokens ?? 1024,
		system: params.system,
		messages: [{ role: "user", content: params.user }],
	})

	const text = message.content
		.filter((block) => block.type === "text")
		.map((block) => block.text)
		.join("")

	const parsed = JSON.parse(text) as unknown

	return params.schema.parse(parsed)
}
