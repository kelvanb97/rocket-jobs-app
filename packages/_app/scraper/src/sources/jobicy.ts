import type { ScrapedRole, TSourceScrapeOptions } from "#types"

type JobicyJob = {
	jobTitle?: string
	url?: string
	jobDescription?: string
	companyName?: string
	jobGeo?: string
	annualSalaryMin?: number
	annualSalaryMax?: number
}

type JobicyResponse = {
	jobs?: JobicyJob[]
}

export async function scrape(
	options?: TSourceScrapeOptions,
): Promise<ScrapedRole[]> {
	const seen = new Set<string>()
	const results: ScrapedRole[] = []

	const response = await fetch(
		`https://jobicy.com/api/v2/remote-jobs?count=50&&geo=usa&industry=engineering`,
	)

	if (!response.ok) {
		console.warn(
			`Failed to fetch from Jobicy: ${response.status} ${response.statusText}`,
		)
		return []
	}

	const data = (await response.json()) as JobicyResponse
	const jobs = data.jobs ?? []

	for (const job of jobs) {
		const url = job.url ?? null
		if (url && seen.has(url)) continue
		if (url) seen.add(url)

		const role: ScrapedRole = {
			title: job.jobTitle ?? "Untitled",
			url,
			company: job.companyName ?? null,
			description: job.jobDescription ?? null,
			source: "jobicy",
			location_type: "remote",
			location: job.jobGeo ?? null,
			salary_min: job.annualSalaryMin ?? null,
			salary_max: job.annualSalaryMax ?? null,
			posted_at: null,
		}

		await options?.onRole?.(role)
		results.push(role)
	}

	return results
}
