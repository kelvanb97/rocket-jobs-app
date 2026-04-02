import { getScraperConfig } from "@rja-api/settings/api/get-scraper-config"
import type { TSourceName } from "@rja-api/settings/schema/scraper-config-schema"
import { filterRoles } from "#lib/filter"
import { insertRole } from "#lib/insert"
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
	"google-jobs": googleJobs as unknown as SourceModule,
	linkedin: linkedin as unknown as SourceModule,
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
	const configResult = getScraperConfig()
	if (!configResult.ok) {
		throw new Error(configResult.error.message)
	}
	if (!configResult.data) {
		throw new Error(
			"Scraper config not found. Please configure scraper settings first.",
		)
	}

	const config = configResult.data

	const {
		sources = config.enabledSources as TSourceName[],
		signal,
		onProgress,
	} = options

	const filterConfig = {
		relevantKeywords: config.relevantKeywords,
		blockedKeywords: config.blockedKeywords,
		blockedCompanies: config.blockedCompanies,
	}

	const companyCache = new Map<string, number>()

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
			const sourceSummary = {
				found: 0,
				filtered: 0,
				inserted: 0,
				skipped: 0,
			}

			const onRole = async (role: ScrapedRole) => {
				sourceSummary.found++

				// Filter
				const { filtered, removedCount } = filterRoles(
					[role],
					filterConfig,
				)
				if (removedCount > 0) {
					sourceSummary.filtered++
					onProgress?.({
						type: "source:role",
						source: name,
						title: role.title,
						company: role.company,
						status: "filtered",
					})
					return
				}

				// Insert immediately
				const result = insertRole(filtered[0]!, companyCache)
				switch (result) {
					case "inserted":
						sourceSummary.inserted++
						break
					case "duplicate":
					case "skipped":
					case "filtered":
						sourceSummary.skipped++
						break
				}

				onProgress?.({
					type: "source:role",
					source: name,
					title: role.title,
					company: role.company,
					status: result,
				})
			}

			const scrapeOptions: TSourceScrapeOptions = { onRole, signal }

			if (name === "google-jobs") {
				await googleJobs.scrape(
					{
						titles: config.googleTitles,
						remote: config.googleRemote,
						fullTimeOnly: config.googleFullTimeOnly,
						freshnessDays: config.googleFreshnessDays,
						maxPagesPerQuery: config.googleMaxPages,
					},
					scrapeOptions,
				)
			} else if (name === "linkedin") {
				await linkedin.scrape(
					{
						urls: config.linkedinUrls,
						maxPages: config.linkedinMaxPages,
						maxPerPage: config.linkedinMaxPerPage,
					},
					scrapeOptions,
				)
			} else {
				await sourceModule.scrape(scrapeOptions)
			}

			onProgress?.({
				type: "source:inserted",
				source: name,
				inserted: sourceSummary.inserted,
				skipped: sourceSummary.skipped,
			})

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
