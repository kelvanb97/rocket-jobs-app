import type { ScrapedRole } from "../lib/insert"

type RemoteOkJob = {
	position?: string
	url?: string
	description?: string
	company?: string
	location?: string
	salary_min?: number
	salary_max?: number
	tags?: string[]
}

const RELEVANT_TAGS = new Set([
	"software",
	"engineering",
	"react",
	"typescript",
	"frontend",
	"fullstack",
	"node",
])

function isRelevant(job: RemoteOkJob): boolean {
	if (!job.tags) return false
	return job.tags.some((tag) => RELEVANT_TAGS.has(tag.toLowerCase()))
}

export async function scrape(): Promise<ScrapedRole[]> {
	const response = await fetch("https://remoteok.com/api", {
		headers: { "User-Agent": "aja-scraper/1.0" },
	})

	if (!response.ok) {
		throw new Error(`Remote OK returned ${response.status}`)
	}

	const data = (await response.json()) as unknown[]

	// First element is metadata, skip it
	const jobs = data.slice(1) as RemoteOkJob[]

	return jobs.filter(isRelevant).map((job) => ({
		title: job.position ?? "Untitled",
		url: job.url ?? null,
		company: job.company ?? null,
		description: job.description ?? null,
		source: "remoteok",
		location_type: "remote",
		location: job.location ?? null,
		salary_min: job.salary_min ?? null,
		salary_max: job.salary_max ?? null,
		posted_at: null,
	}))
}
