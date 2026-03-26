import { Ollama } from "ollama"
import { z } from "zod"

export type TOllamaModel = string

const envSchema = z.object({
	OLLAMA_BASE_URL: z.url().default("http://127.0.0.1:11434"),
	OLLAMA_MODEL: z.string().min(1).default("llama3"),
})

let _client: Ollama | null = null

const getClient = (): Ollama => {
	if (!_client) {
		const env = envSchema.parse(process.env)
		_client = new Ollama({ host: env.OLLAMA_BASE_URL })
	}
	return _client
}

type TCreateMessageParams<T> = {
	model: TOllamaModel
	system: string
	user: string
	maxTokens?: number
	schema: z.ZodType<T>
}

export async function createMessage<T>(
	params: TCreateMessageParams<T>,
): Promise<T> {
	const client = getClient()

	const promptLength = params.system.length + params.user.length
	console.log(
		`[ollama] Sending request to model: "${params.model}" (Prompt length: ${promptLength} chars)`,
	)

	const response = await client.chat({
		model: params.model,
		messages: [
			{ role: "system", content: params.system },
			{ role: "user", content: params.user },
		],
		format: "json",
		options: {
			num_ctx: 8192,
			num_predict: params.maxTokens ?? 2048,
		},
	})

	const content = response.message.content

	try {
		if (!content) {
			console.error("[ollama] Received empty content from chat")
			throw new Error("Empty response from Ollama")
		}
		const parsed = JSON.parse(content)
		return params.schema.parse(parsed)
	} catch (error) {
		console.error("[ollama] Failed to parse response content:", content)
		console.error("[ollama] Chat metadata:", {
			done: response.done,
			total_duration: response.total_duration,
			load_duration: response.load_duration,
			prompt_eval_count: response.prompt_eval_count,
			eval_count: response.eval_count,
		})
		throw error
	}
}
