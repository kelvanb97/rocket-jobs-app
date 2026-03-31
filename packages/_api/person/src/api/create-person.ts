import { person } from "@rja-app/drizzle"
import { db } from "@rja-core/drizzle"
import { errFrom, ok, type TResult } from "@rja-core/result"
import type { TCreatePerson, TPerson } from "#schema/person-schema"

export function createPerson(input: TCreatePerson): TResult<TPerson> {
	try {
		const row = db().insert(person).values(input).returning().get()
		return ok(row)
	} catch (e) {
		return errFrom(
			`Error creating person: ${e instanceof Error ? e.message : String(e)}`,
		)
	}
}
