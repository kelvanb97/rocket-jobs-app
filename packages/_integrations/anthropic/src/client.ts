import Anthropic from "@anthropic-ai/sdk"
import { z } from "zod"

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

	const inputSchema = z.toJSONSchema(params.schema)

	const message = await client.messages.create({
		model: params.model,
		max_tokens: params.maxTokens ?? 1024,
		system: params.system,
		messages: [{ role: "user", content: params.user }],
		tools: [
			{
				name: "respond",
				description: "Respond with structured output",
				input_schema: inputSchema as {
					type: "object"
					[key: string]: unknown
				},
			},
		],
		tool_choice: { type: "tool", name: "respond" },
	})

	const toolUse = message.content.find((block) => block.type === "tool_use")
	if (!toolUse || toolUse.type !== "tool_use") {
		throw new Error("No tool use block in response")
	}

	return params.schema.parse(toolUse.input)
}
