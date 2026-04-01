import { workExperience } from "@rja-app/drizzle"
import { db } from "@rja-core/drizzle"
import { errFrom, ok, type TResult } from "@rja-core/result"
import { eq } from "drizzle-orm"

export function deleteWorkExperience(id: number): TResult<{ id: number }> {
	try {
		db().delete(workExperience).where(eq(workExperience.id, id)).run()
		return ok({ id })
	} catch (e) {
		return errFrom(
			`Error deleting work experience: ${e instanceof Error ? e.message : String(e)}`,
		)
	}
}
