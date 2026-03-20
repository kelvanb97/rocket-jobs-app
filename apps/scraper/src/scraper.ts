import { SCRAPER_CONFIG, type TSourceName } from "@aja-config/user/scraper"
import { insertRoles, type ScrapedRole } from "./lib/insert"
import * as googleJobs from "./sources/google-jobs"
import * as himalayas from "./sources/himalayas"
import * as jobicy from "./sources/jobicy"
import * as remoteok from "./sources/remoteok"
import * as weworkremotely from "./sources/weworkremotely"

const RELEVANT_TITLE_RE = new RegExp(
	SCRAPER_CONFIG.relevantKeywords.join("|"),
	"i",
)

const BLOCKED_TITLE_RE = new RegExp(
	SCRAPER_CONFIG.blockedKeywords
		.map((kw) => `\\b${kw.replace(/\s+/g, ".?")}\\b`)
		.join("|"),
	"i",
)

type SourceModule = {
	scrape: () => Promise<ScrapedRole[]>
}

const allSources: Record<TSourceName, SourceModule> = {
	remoteok,
	weworkremotely,
	himalayas,
	jobicy,
	"google-jobs": googleJobs,
}

const sources: Record<string, SourceModule> = Object.fromEntries(
	SCRAPER_CONFIG.enabledSources.map((name) => [name, allSources[name]]),
)

type ScrapeSummary = {
	total: {
		found: number
		filtered: number
		inserted: number
		skipped: number
		errors: number
	}
	sources: Record<
		string,
		{
			found: number
			filtered: number
			inserted: number
			skipped: number
			error?: string
		}
	>
}

export const SOURCE_NAMES = Object.keys(sources)

export async function runScraper(only?: string): Promise<ScrapeSummary> {
	if (only && !(only in sources)) {
		throw new Error(
			`Unknown source "${only}". Available: ${SOURCE_NAMES.join(", ")}`,
		)
	}

	const entries = only
		? [[only, sources[only]!] as const]
		: Object.entries(sources)

	const results = await Promise.allSettled(
		entries.map(async ([name, source]) => {
			const allRoles = await source.scrape()
			const roles = allRoles.filter(
				(r) =>
					RELEVANT_TITLE_RE.test(r.title) &&
					!BLOCKED_TITLE_RE.test(r.title),
			)
			const filtered = allRoles.length - roles.length
			const { inserted, skipped } = await insertRoles(roles)
			return { name, found: allRoles.length, filtered, inserted, skipped }
		}),
	)

	const summary: ScrapeSummary = {
		total: { found: 0, filtered: 0, inserted: 0, skipped: 0, errors: 0 },
		sources: {},
	}

	for (let i = 0; i < entries.length; i++) {
		const name = entries[i]![0]
		const result = results[i]!

		if (result.status === "fulfilled") {
			const { found, filtered, inserted, skipped } = result.value
			summary.sources[name] = { found, filtered, inserted, skipped }
			summary.total.found += found
			summary.total.filtered += filtered
			summary.total.inserted += inserted
			summary.total.skipped += skipped
			console.log(
				`[${name}] found=${found} filtered=${filtered} inserted=${inserted} skipped=${skipped}`,
			)
		} else {
			const error =
				result.reason instanceof Error
					? result.reason.message
					: String(result.reason)
			summary.sources[name] = {
				found: 0,
				filtered: 0,
				inserted: 0,
				skipped: 0,
				error,
			}
			summary.total.errors += 1
			console.error(`[${name}] error: ${error}`)
		}
	}

	console.log(
		`[total] found=${summary.total.found} filtered=${summary.total.filtered} inserted=${summary.total.inserted} skipped=${summary.total.skipped} errors=${summary.total.errors}`,
	)

	return summary
}
