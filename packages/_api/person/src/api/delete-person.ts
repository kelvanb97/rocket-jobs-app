import { person } from "@rja-app/drizzle"
import { db } from "@rja-core/drizzle"
import { errFrom, ok, type TResult } from "@rja-core/result"
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
