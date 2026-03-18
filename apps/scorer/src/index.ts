import { runBackfill, runLabeler } from "./eval/labeler.js"
import { runScorer } from "./scorer.js"

async function main() {
	if (process.argv.includes("--label")) {
		await runLabeler()
		process.exit(0)
	}

	if (process.argv.includes("--backfill")) {
		await runBackfill()
		process.exit(0)
	}

	console.log("Running scorer...")
	const summary = await runScorer()
	console.log("Scoring complete.", JSON.stringify(summary))
	process.exit(0)
}

main().catch((err) => {
	console.error("Fatal error:", err)
	process.exit(1)
})
