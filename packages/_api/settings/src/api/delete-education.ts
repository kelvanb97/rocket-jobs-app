import { education } from "@rja-app/drizzle"
import { db } from "@rja-core/drizzle"
import { errFrom, ok, type TResult } from "@rja-core/result"
import { eq } from "drizzle-orm"

export function deleteEducation(id: number): TResult<{ id: number }> {
	try {
		db().delete(education).where(eq(education.id, id)).run()
		return ok({ id })
	} catch (e) {
		return errFrom(
			`Error deleting education: ${e instanceof Error ? e.message : String(e)}`,
		)
	}
}
