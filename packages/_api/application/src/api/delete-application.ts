import { application } from "@rja-app/drizzle"
import { db } from "@rja-core/drizzle"
import { errFrom, ok, type TResult } from "@rja-core/result"
import { eq } from "drizzle-orm"

export function deleteApplication(id: number): TResult<{ id: number }> {
	try {
		db().delete(application).where(eq(application.id, id)).run()
		return ok({ id })
	} catch (e) {
		return errFrom(
			`Error deleting application: ${e instanceof Error ? e.message : String(e)}`,
		)
	}
}
