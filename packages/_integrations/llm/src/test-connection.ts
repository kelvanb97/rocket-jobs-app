import { createMessage } from "@aja-integrations/llm/client"
import { z } from "zod"

const schema = z.object({
	greeting: z.string(),
})

async function test(provider: "anthropic" | "ollama") {
	console.log(`Testing provider: ${provider}...`)
	process.env["LLM_PROVIDER"] = provider
	
	try {
		const response = await createMessage({
			model: provider === "anthropic" 
				? (process.env["SCORE_MODEL"] ?? "claude-haiku-4-5-20251001")
				: (process.env["OLLAMA_MODEL"] ?? "llama3"),
			system: "You are a helpful assistant.",
			user: "Say hello in JSON format with a 'greeting' field.",
			schema,
		})
		console.log(`Success with ${provider}:`, response)
	} catch (error) {
		console.error(`Error with ${provider}:`, error)
	}
}

async function main() {
	// Note: This requires valid API key for Anthropic and a running Ollama for Ollama.
	// We'll just run them if they are configured.
	if (process.env["ANTHROPIC_API_KEY"]) {
		await test("anthropic")
	} else {
		console.log("Skipping Anthropic test (no API key)")
	}
	
	await test("ollama")
}

main()
