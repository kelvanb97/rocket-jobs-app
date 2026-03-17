import cron from "node-cron"
import { runScraper } from "./scraper.js"

const EVERY_HOUR_CRON = "0 */1 * * *"
const SCRAPER_CRON_SCHEDULE =
	process.env["SCRAPER_CRON_SCHEDULE"] ?? EVERY_HOUR_CRON

function getArg(flag: string): string | undefined {
	const idx = process.argv.indexOf(flag)
	return idx !== -1 ? process.argv[idx + 1] : undefined
}

async function main() {
	if (process.argv.includes("--now")) {
		const source = getArg("--source")
		console.log(
			source
				? `Running scraper for source: ${source}`
				: "Running scraper immediately...",
		)
		const summary = await runScraper(source)
		console.log("Scrape complete.", JSON.stringify(summary.total))
		process.exit(0)
	}

	console.log(`Scheduling scraper with cron: ${SCRAPER_CRON_SCHEDULE}`)
	cron.schedule(SCRAPER_CRON_SCHEDULE, async () => {
		console.log(
			`[${new Date().toISOString()}] Cron triggered, starting scrape`,
		)
		try {
			await runScraper()
		} catch (err) {
			console.error("Scrape failed:", err)
		}
	})
}

main().catch((err) => {
	console.error("Fatal error:", err)
	process.exit(1)
})
