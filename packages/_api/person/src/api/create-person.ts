import { person } from "@aja-app/drizzle"
import { db } from "@aja-core/drizzle"
import { errFrom, ok, type TResult } from "@aja-core/result"
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
