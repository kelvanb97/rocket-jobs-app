import { eeoConfig } from "@rja-app/drizzle"
import type { TEeoConfig } from "@rja-app/drizzle"
import { db } from "@rja-core/drizzle"
import { errFrom, ok, type TResult } from "@rja-core/result"

export function getEeoConfig(): TResult<TEeoConfig | null> {
	try {
		const row = db().select().from(eeoConfig).limit(1).get()
		return ok(row ?? null)
	} catch (e) {
		return errFrom(
			`Error fetching EEO config: ${e instanceof Error ? e.message : String(e)}`,
		)
	}
}
