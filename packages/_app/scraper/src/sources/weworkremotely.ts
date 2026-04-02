import type { ScrapedRole, TSourceScrapeOptions } from "#types"
import Parser from "rss-parser"

function extractCompany(title: string): string | null {
	const colonIndex = title.indexOf(":")
	if (colonIndex === -1) return null
	return title.slice(0, colonIndex).trim()
}

export async function scrape(
	options?: TSourceScrapeOptions,
): Promise<ScrapedRole[]> {
	const parser = new Parser()
	const feed = await parser.parseURL(
		"https://weworkremotely.com/categories/remote-programming-jobs.rss",
	)

	const results: ScrapedRole[] = []

	for (const item of feed.items) {
		const role: ScrapedRole = {
			title: item.title ?? "Untitled",
			url: item.link ?? null,
			company: item.title ? extractCompany(item.title) : null,
			description: item.contentSnippet ?? null,
			source: "weworkremotely",
			location_type: "remote",
			location: null,
			salary_min: null,
			salary_max: null,
			posted_at: item.pubDate ?? null,
		}

		await options?.onRole?.(role)
		results.push(role)
	}

	return results
}
