import { company } from "@rja-app/drizzle"
import { db } from "@rja-core/drizzle"
import { errFrom, ok, type TResult } from "@rja-core/result"
import { eq } from "drizzle-orm"

export function deleteCompany(id: number): TResult<{ id: number }> {
	try {
		db().delete(company).where(eq(company.id, id)).run()
		return ok({ id })
	} catch (e) {
		return errFrom(
			`Error deleting company: ${e instanceof Error ? e.message : String(e)}`,
		)
	}
}
