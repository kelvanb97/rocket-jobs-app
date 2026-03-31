import { company } from "@rja-app/drizzle"
import { db } from "@rja-core/drizzle"
import { errFrom, ok, type TResult } from "@rja-core/result"
import type { TCompany, TUpdateCompany } from "#schema/company-schema"
import { eq } from "drizzle-orm"

export function updateCompany(input: TUpdateCompany): TResult<TCompany> {
	try {
		const row = db()
			.update(company)
			.set(input)
			.where(eq(company.id, input.id))
			.returning()
			.get()
		if (!row) return errFrom(`Company not found: ${input.id}`)
		return ok(row)
	} catch (e) {
		return errFrom(
			`Error updating company: ${e instanceof Error ? e.message : String(e)}`,
		)
	}
}
