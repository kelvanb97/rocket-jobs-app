import { insertRoles, type ScrapedRole } from "./lib/insert"
import * as himalayas from "./sources/himalayas"
import * as jobicy from "./sources/jobicy"
import * as remoteok from "./sources/remoteok"
import * as weworkremotely from "./sources/weworkremotely"

type SourceModule = {
	scrape: () => Promise<ScrapedRole[]>
}

const sources: Record<string, SourceModule> = {
	remoteok,
	weworkremotely,
	himalayas,
	jobicy,
}

type ScrapeSummary = {
	total: { found: number; inserted: number; skipped: number; errors: number }
	sources: Record<
		string,
		{ found: number; inserted: number; skipped: number; error?: string }
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
			const roles = await source.scrape()
			const { inserted, skipped } = await insertRoles(roles)
			return { name, found: roles.length, inserted, skipped }
		}),
	)

	const summary: ScrapeSummary = {
		total: { found: 0, inserted: 0, skipped: 0, errors: 0 },
		sources: {},
	}

	for (let i = 0; i < entries.length; i++) {
		const name = entries[i]![0]
		const result = results[i]!

		if (result.status === "fulfilled") {
			const { found, inserted, skipped } = result.value
			summary.sources[name] = { found, inserted, skipped }
			summary.total.found += found
			summary.total.inserted += inserted
			summary.total.skipped += skipped
			console.log(
				`[${name}] found=${found} inserted=${inserted} skipped=${skipped}`,
			)
		} else {
			const error =
				result.reason instanceof Error
					? result.reason.message
					: String(result.reason)
			summary.sources[name] = { found: 0, inserted: 0, skipped: 0, error }
			summary.total.errors += 1
			console.error(`[${name}] error: ${error}`)
		}
	}

	console.log(
		`[total] found=${summary.total.found} inserted=${summary.total.inserted} skipped=${summary.total.skipped} errors=${summary.total.errors}`,
	)

	return summary
}
