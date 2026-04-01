import { scraperConfig } from "@rja-app/drizzle"
import type { TScraperConfig } from "@rja-app/drizzle"
import { db } from "@rja-core/drizzle"
import { errFrom, ok, type TResult } from "@rja-core/result"

export function getScraperConfig(): TResult<TScraperConfig | null> {
	try {
		const row = db().select().from(scraperConfig).limit(1).get()
		return ok(row ?? null)
	} catch (e) {
		return errFrom(
			`Error fetching scraper config: ${e instanceof Error ? e.message : String(e)}`,
		)
	}
}
