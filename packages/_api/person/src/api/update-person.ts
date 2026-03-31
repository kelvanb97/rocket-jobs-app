import { person } from "@rja-app/drizzle"
import { db } from "@rja-core/drizzle"
import { errFrom, ok, type TResult } from "@rja-core/result"
import type { TPerson, TUpdatePerson } from "#schema/person-schema"
import { eq } from "drizzle-orm"

export function updatePerson(input: TUpdatePerson): TResult<TPerson> {
	try {
		const row = db()
			.update(person)
			.set(input)
			.where(eq(person.id, input.id))
			.returning()
			.get()
		if (!row) return errFrom(`Person not found: ${input.id}`)
		return ok(row)
	} catch (e) {
		return errFrom(
			`Error updating person: ${e instanceof Error ? e.message : String(e)}`,
		)
	}
}
