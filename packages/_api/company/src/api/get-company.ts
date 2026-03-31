import { company } from "@rja-app/drizzle"
import { db } from "@rja-core/drizzle"
import { errFrom, ok, type TResult } from "@rja-core/result"
import type { TCompany } from "#schema/company-schema"
import { eq } from "drizzle-orm"

export function getCompany(id: number): TResult<TCompany> {
	try {
		const row = db().select().from(company).where(eq(company.id, id)).get()
		if (!row) return errFrom(`Company not found: ${id}`)
		return ok(row)
	} catch (e) {
		return errFrom(
			`Error fetching company: ${e instanceof Error ? e.message : String(e)}`,
		)
	}
}
