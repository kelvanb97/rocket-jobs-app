import type { ScrapedRole, TSourceScrapeOptions } from "#types"

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

export async function scrape(
	options?: TSourceScrapeOptions,
): Promise<ScrapedRole[]> {
	const response = await fetch("https://remoteok.com/api", {
		headers: { "User-Agent": "rja-scraper/1.0" },
	})

	if (!response.ok) {
		throw new Error(`Remote OK returned ${response.status}`)
	}

	const data = (await response.json()) as unknown[]

	// First element is metadata, skip it
	const jobs = data.slice(1) as RemoteOkJob[]
	const results: ScrapedRole[] = []

	for (const job of jobs) {
		const role: ScrapedRole = {
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
		}

		await options?.onRole?.(role)
		results.push(role)
	}

	return results
}
