import Parser from "rss-parser"
import type { ScrapedRole } from "../lib/insert"

const TITLE_KEYWORDS =
	/engineer|developer|frontend|fullstack|react|backend|software/i

function extractCompany(title: string): string | null {
	const colonIndex = title.indexOf(":")
	if (colonIndex === -1) return null
	return title.slice(0, colonIndex).trim()
}

export async function scrape(): Promise<ScrapedRole[]> {
	const parser = new Parser()
	const feed = await parser.parseURL(
		"https://weworkremotely.com/categories/remote-programming-jobs.rss",
	)

	return feed.items
		.filter((item) => item.title && TITLE_KEYWORDS.test(item.title))
		.map((item) => ({
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
		}))
}
