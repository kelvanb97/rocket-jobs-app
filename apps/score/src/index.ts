import { runScore } from "./score"

try {
	process.loadEnvFile("../../.env")
} catch {
	// Ignore if .env file is missing (e.g. in Docker)
}

async function main() {
	console.log("Running score...")
	const summary = await runScore()
	console.log("Scoring complete.", JSON.stringify(summary))
	process.exit(0)
}

main().catch((err) => {
	console.error("Fatal error:", err)
	process.exit(1)
})
