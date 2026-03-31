import { company } from "@rja-app/drizzle"
import { db } from "@rja-core/drizzle"
import { errFrom, ok, type TResult } from "@rja-core/result"
import type { TCompany, TCreateCompany } from "#schema/company-schema"

export function createCompany(input: TCreateCompany): TResult<TCompany> {
	try {
		const row = db().insert(company).values(input).returning().get()
		return ok(row)
	} catch (e) {
		return errFrom(
			`Error creating company: ${e instanceof Error ? e.message : String(e)}`,
		)
	}
}
