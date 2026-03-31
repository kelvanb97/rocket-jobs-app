import { score } from "@rja-app/drizzle"
import { db } from "@rja-core/drizzle"
import { errFrom, ok, type TResult } from "@rja-core/result"
import { eq } from "drizzle-orm"

export function deleteScore(id: number): TResult<{ id: number }> {
	try {
		db().delete(score).where(eq(score.id, id)).run()
		return ok({ id })
	} catch (e) {
		return errFrom(
			`Error deleting score: ${e instanceof Error ? e.message : String(e)}`,
		)
	}
}
