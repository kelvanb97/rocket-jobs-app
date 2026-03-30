import { person } from "@aja-app/drizzle"
import { db } from "@aja-core/drizzle"
import { errFrom, ok, type TResult } from "@aja-core/result"
import { eq } from "drizzle-orm"

export function deletePerson(id: number): TResult<{ id: number }> {
	try {
		db().delete(person).where(eq(person.id, id)).run()
		return ok({ id })
	} catch (e) {
		return errFrom(
			`Error deleting person: ${e instanceof Error ? e.message : String(e)}`,
		)
	}
}
