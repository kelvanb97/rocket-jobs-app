import { scraperConfig } from "@rja-app/drizzle"
import type { TScraperConfig } from "@rja-app/drizzle"
import { db } from "@rja-core/drizzle"
import { errFrom, ok, type TResult } from "@rja-core/result"
import type { TUpsertScraperConfig } from "#schema/scraper-config-schema"

export function upsertScraperConfig(
	input: TUpsertScraperConfig,
): TResult<TScraperConfig> {
	try {
		const result = db()
			.insert(scraperConfig)
			.values(input)
			.onConflictDoUpdate({
				target: scraperConfig.userProfileId,
				set: {
					relevantKeywords: input.relevantKeywords,
					blockedKeywords: input.blockedKeywords,
					blockedCompanies: input.blockedCompanies,
					enabledSources: input.enabledSources,
					googleTitles: input.googleTitles,
					googleRemote: input.googleRemote,
					googleFullTimeOnly: input.googleFullTimeOnly,
					googleFreshnessDays: input.googleFreshnessDays,
					googleMaxPages: input.googleMaxPages,
					linkedinUrls: input.linkedinUrls,
					linkedinMaxPages: input.linkedinMaxPages,
					linkedinMaxPerPage: input.linkedinMaxPerPage,
				},
			})
			.returning()
			.get()
		return ok(result)
	} catch (e) {
		return errFrom(
			`Error upserting scraper config: ${e instanceof Error ? e.message : String(e)}`,
		)
	}
}
