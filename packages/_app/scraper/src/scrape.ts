import { SCRAPER_CONFIG, type TSourceName } from "@aja-config/user/scraper"
import { filterRoles } from "#lib/filter"
import { insertRoles } from "#lib/insert"
import * as googleJobs from "#sources/google-jobs/index"
import * as himalayas from "#sources/himalayas"
import * as jobicy from "#sources/jobicy"
import * as linkedin from "#sources/linkedin/index"
import * as remoteok from "#sources/remoteok"
import * as weworkremotely from "#sources/weworkremotely"
import type {
	ScrapedRole,
	TScrapeProgressCallback,
	TSourceScrapeOptions,
} from "#types"

type SourceModule = {
	scrape: (options?: TSourceScrapeOptions) => Promise<ScrapedRole[]>
}

const ALL_SOURCES: Record<TSourceName, SourceModule> = {
	remoteok,
	weworkremotely,
	himalayas,
	jobicy,
	"google-jobs": googleJobs,
	linkedin,
}

export type TScrapeSummary = {
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

export type TScrapeOptions = {
	sources?: TSourceName[]
	signal?: AbortSignal
	onProgress?: TScrapeProgressCallback
}

export async function runScraper(
	options: TScrapeOptions = {},
): Promise<TScrapeSummary> {
	const {
		sources = SCRAPER_CONFIG.enabledSources,
		signal,
		onProgress,
	} = options

	const summary: TScrapeSummary = {
		total: { found: 0, filtered: 0, inserted: 0, skipped: 0, errors: 0 },
		sources: {},
	}

	for (const name of sources) {
		if (signal?.aborted) break

		const sourceModule = ALL_SOURCES[name]
		if (!sourceModule) {
			console.warn(`Unknown source "${name}", skipping`)
			continue
		}

		onProgress?.({ type: "source:start", source: name })

		try {
			let batchPageCount = 0
			const sourceSummary = {
				found: 0,
				filtered: 0,
				inserted: 0,
				skipped: 0,
			}

			const onBatch = async (roles: ScrapedRole[]) => {
				batchPageCount++
				sourceSummary.found += roles.length

				const { filtered, removedCount } = filterRoles(roles)
				const { inserted, skipped } = await insertRoles(
					filtered,
					signal,
				)

				sourceSummary.filtered += removedCount
				sourceSummary.inserted += inserted
				sourceSummary.skipped += skipped

				onProgress?.({
					type: "source:page",
					source: name,
					page: batchPageCount,
					found: roles.length,
					inserted,
					skipped,
					filtered: removedCount,
				})

				console.log(
					`[${name}] page ${batchPageCount}: found=${roles.length} filtered=${removedCount} inserted=${inserted} skipped=${skipped}`,
				)
			}

			const allRoles = await sourceModule.scrape({
				onBatch,
				signal,
			})

			if (batchPageCount === 0 && allRoles.length > 0) {
				// Source did not use onBatch — process in bulk
				onProgress?.({
					type: "source:found",
					source: name,
					count: allRoles.length,
				})

				const { filtered: roles, removedCount } = filterRoles(allRoles)
				const { inserted, skipped } = await insertRoles(roles, signal)

				sourceSummary.found = allRoles.length
				sourceSummary.filtered = removedCount
				sourceSummary.inserted = inserted
				sourceSummary.skipped = skipped

				onProgress?.({
					type: "source:inserted",
					source: name,
					inserted,
					skipped,
				})
			} else if (batchPageCount > 0) {
				onProgress?.({
					type: "source:inserted",
					source: name,
					inserted: sourceSummary.inserted,
					skipped: sourceSummary.skipped,
				})
			}

			summary.sources[name] = sourceSummary
			summary.total.found += sourceSummary.found
			summary.total.filtered += sourceSummary.filtered
			summary.total.inserted += sourceSummary.inserted
			summary.total.skipped += sourceSummary.skipped

			console.log(
				`[${name}] found=${sourceSummary.found} filtered=${sourceSummary.filtered} inserted=${sourceSummary.inserted} skipped=${sourceSummary.skipped}`,
			)
		} catch (err) {
			const error = err instanceof Error ? err.message : String(err)
			summary.sources[name] = {
				found: 0,
				filtered: 0,
				inserted: 0,
				skipped: 0,
				error,
			}
			summary.total.errors += 1
			onProgress?.({ type: "source:error", source: name, error })
			console.error(`[${name}] error: ${error}`)
		}

		onProgress?.({ type: "source:done", source: name })
	}

	console.log(
		`[total] found=${summary.total.found} filtered=${summary.total.filtered} inserted=${summary.total.inserted} skipped=${summary.total.skipped} errors=${summary.total.errors}`,
	)

	onProgress?.({ type: "done" })

	return summary
}
