import { runScraper } from "./scraper"

try {
	process.loadEnvFile("../../.env")
} catch {
	// Ignore if .env file is missing (e.g. in Docker)
}

function getArg(flag: string): string | undefined {
	const idx = process.argv.indexOf(flag)
	return idx !== -1 ? process.argv[idx + 1] : undefined
}

async function main() {
	const source = getArg("--source")
	console.log(
		source
			? `Running scraper for source: ${source}`
			: "Running scraper for all sources...",
	)
	const summary = await runScraper(source)
	console.log("Scrape complete.", JSON.stringify(summary.total))
}

main().catch((err) => {
	console.error("Fatal error:", err)
	process.exit(1)
})
