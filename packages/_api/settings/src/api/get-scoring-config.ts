import { scoringConfig } from "@rja-app/drizzle"
import type { TScoringConfig } from "@rja-app/drizzle"
import { db } from "@rja-core/drizzle"
import { errFrom, ok, type TResult } from "@rja-core/result"

export function getScoringConfig(): TResult<TScoringConfig | null> {
	try {
		const row = db().select().from(scoringConfig).limit(1).get()
		return ok(row ?? null)
	} catch (e) {
		return errFrom(
			`Error fetching scoring config: ${e instanceof Error ? e.message : String(e)}`,
		)
	}
}
