import { role } from "@rja-app/drizzle"
import { db } from "@rja-core/drizzle"
import { errFrom, ok, type TResult } from "@rja-core/result"
import { eq } from "drizzle-orm"

export function deleteRole(id: number): TResult<{ id: number }> {
	try {
		db().delete(role).where(eq(role.id, id)).run()
		return ok({ id })
	} catch (e) {
		return errFrom(
			`Error deleting role: ${e instanceof Error ? e.message : String(e)}`,
		)
	}
}
