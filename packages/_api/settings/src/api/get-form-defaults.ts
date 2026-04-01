import { formDefaults } from "@rja-app/drizzle"
import type { TFormDefaults } from "@rja-app/drizzle"
import { db } from "@rja-core/drizzle"
import { errFrom, ok, type TResult } from "@rja-core/result"

export function getFormDefaults(): TResult<TFormDefaults | null> {
	try {
		const row = db().select().from(formDefaults).limit(1).get()
		return ok(row ?? null)
	} catch (e) {
		return errFrom(
			`Error fetching form defaults: ${e instanceof Error ? e.message : String(e)}`,
		)
	}
}
