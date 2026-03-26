import type { ScrapedRole, TSourceScrapeOptions } from "#types"

type HimalayasJob = {
	title?: string
	applicationLink?: string
	guid?: string
	description?: string
	companyName?: string
	locationRestrictions?: string[]
	minSalary?: number
	maxSalary?: number
	currency?: string
	pubDate?: number
}

type HimalayasResponse = {
	jobs?: HimalayasJob[]
}

const QUERIES = [
	"software engineer",
	"frontend engineer",
	"fullstack engineer",
	"react developer",
	"typescript developer",
	"node.js engineer",
]

const MAX_PAGES = 5

function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

function formatPubDate(epoch: number): string {
	return new Date(epoch * 1000).toISOString()
}

// example query: https://himalayas.app/jobs/api/search?q=software+engineer&country=US&seniority=Mid-level%2CSenior&employment_type=Full+Time&sort=recent&page=1
async function fetchPage(
	query: string,
	page: number,
): Promise<HimalayasResponse> {
	const params = new URLSearchParams({
		q: query,
		country: "US",
		seniority: "Mid-level,Senior",
		employment_type: "Full Time",
		sort: "recent",
		page: String(page),
	})

	const response = await fetch(
		`https://himalayas.app/jobs/api/search?${params}`,
	)

	if (!response.ok) {
		throw new Error(`Himalayas returned ${response.status} for "${query}"`)
	}

	return (await response.json()) as HimalayasResponse
}

export async function scrape(
	options?: TSourceScrapeOptions,
): Promise<ScrapedRole[]> {
	const { onProgress } = options ?? {}
	const seen = new Set<string>()
	const results: ScrapedRole[] = []

	for (const query of QUERIES) {
		let page = 1

		while (page <= MAX_PAGES) {
			onProgress?.({
				type: "source:status",
				source: "himalayas",
				status: `Searching for "${query}" (page ${page})...`,
			})

			const data = await fetchPage(query, page)

			const jobs = data.jobs ?? []

			console.log(
				`[himalayas] "${query}" page ${page}: ${jobs.length} jobs`,
			)

			if (jobs.length === 0) break

			for (const job of jobs) {
				const url = job.applicationLink ?? job.guid ?? null
				if (url && seen.has(url)) continue
				if (url) seen.add(url)

				results.push({
					title: job.title ?? "Untitled",
					url,
					company: job.companyName ?? null,
					description: job.description ?? null,
					source: "himalayas",
					location_type: "remote",
					location: job.locationRestrictions?.join(", ") ?? null,
					salary_min:
						job.minSalary != null
							? Math.round(job.minSalary)
							: null,
					salary_max:
						job.maxSalary != null
							? Math.round(job.maxSalary)
							: null,
					posted_at: job.pubDate ? formatPubDate(job.pubDate) : null,
				})
			}

			await delay(1000)
			page++
		}
	}

	return results
}
