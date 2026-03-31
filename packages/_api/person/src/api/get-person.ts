import { person } from "@rja-app/drizzle"
import { db } from "@rja-core/drizzle"
import { errFrom, ok, type TResult } from "@rja-core/result"
import type { TPerson } from "#schema/person-schema"
import { eq } from "drizzle-orm"

export function getPerson(id: number): TResult<TPerson> {
	try {
		const row = db().select().from(person).where(eq(person.id, id)).get()
		if (!row) return errFrom(`Person not found: ${id}`)
		return ok(row)
	} catch (e) {
		return errFrom(
			`Error fetching person: ${e instanceof Error ? e.message : String(e)}`,
		)
	}
}
