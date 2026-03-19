import { randomUUID } from "node:crypto"
import {
	createServer,
	type IncomingMessage,
	type ServerResponse,
} from "node:http"
import cron from "node-cron"
import { runScraper } from "./scraper.js"

const EVERY_HOUR_CRON = "0 */1 * * *"
const SCRAPER_CRON_SCHEDULE =
	process.env["SCRAPER_CRON_SCHEDULE"] ?? EVERY_HOUR_CRON
const SCRAPER_HTTP_PORT = Number(process.env["SCRAPER_HTTP_PORT"] ?? 3001)

type RunStatus = "running" | "completed" | "failed"

type RunRecord = {
	id: string
	status: RunStatus
	startedAt: string
	completedAt?: string
	summary?: unknown
	error?: string
}

const runs = new Map<string, RunRecord>()

function getArg(flag: string): string | undefined {
	const idx = process.argv.indexOf(flag)
	return idx !== -1 ? process.argv[idx + 1] : undefined
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
	const payload = JSON.stringify(body)
	res.writeHead(status, {
		"Content-Type": "application/json",
		"Content-Length": Buffer.byteLength(payload),
	})
	res.end(payload)
}

function startRun(source?: string): string {
	const id = randomUUID()
	const record: RunRecord = {
		id,
		status: "running",
		startedAt: new Date().toISOString(),
	}
	runs.set(id, record)

	runScraper(source)
		.then((summary) => {
			record.status = "completed"
			record.completedAt = new Date().toISOString()
			record.summary = summary.total
		})
		.catch((err: unknown) => {
			record.status = "failed"
			record.completedAt = new Date().toISOString()
			record.error = err instanceof Error ? err.message : String(err)
		})

	return id
}

function handleRequest(req: IncomingMessage, res: ServerResponse): void {
	const url = req.url ?? "/"
	const method = req.method ?? "GET"

	if (method === "POST" && url === "/scrape") {
		const id = startRun()
		sendJson(res, 202, { runId: id })
		return
	}

	const statusMatch = url.match(/^\/scrape\/([^/]+)\/status$/)
	if (method === "GET" && statusMatch) {
		const runId = statusMatch[1]!
		const record = runs.get(runId)
		if (!record) {
			sendJson(res, 404, { error: "Run not found" })
			return
		}
		sendJson(res, 200, record)
		return
	}

	sendJson(res, 404, { error: "Not found" })
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

	const server = createServer(handleRequest)
	server.listen(SCRAPER_HTTP_PORT, () => {
		console.log(`HTTP server listening on port ${SCRAPER_HTTP_PORT}`)
	})
}

main().catch((err) => {
	console.error("Fatal error:", err)
	process.exit(1)
})
