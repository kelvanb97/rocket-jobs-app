import { Ollama } from "ollama"
import { z } from "zod"

export type TOllamaModel = string

const envSchema = z.object({
	OLLAMA_BASE_URL: z.string().url().default("http://127.0.0.1:11434"),
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

	const response = await client.generate({
		model: params.model,
		system: params.system,
		prompt: params.user,
		format: "json",
		options: {
			num_predict: params.maxTokens ?? 1024,
		},
	})

	try {
		const parsed = JSON.parse(response.response)
		return params.schema.parse(parsed)
	} catch (error) {
		console.error("Failed to parse Ollama response:", response.response)
		throw error
	}
}
