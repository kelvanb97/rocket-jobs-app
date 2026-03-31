import { company } from "@rja-app/drizzle"
import { db } from "@rja-core/drizzle"
import { errFrom, ok, type TResult } from "@rja-core/result"
import type { TCompany, TListCompanies } from "#schema/company-schema"
import { and, desc, eq, like } from "drizzle-orm"

export function listCompanies(
	input: TListCompanies,
): TResult<{ companies: TCompany[]; hasNext: boolean }> {
	try {
		const conditions = []

		if (input.search) {
			conditions.push(like(company.name, `%${input.search}%`))
		}
		if (input.industry) {
			conditions.push(eq(company.industry, input.industry))
		}
		if (input.stage) {
			conditions.push(eq(company.stage, input.stage))
		}
		if (input.size) {
			conditions.push(eq(company.size, input.size))
		}

		const offset = (input.page - 1) * input.pageSize

		const rows = db()
			.select()
			.from(company)
			.where(conditions.length > 0 ? and(...conditions) : undefined)
			.orderBy(desc(company.createdAt), company.id)
			.limit(input.pageSize + 1)
			.offset(offset)
			.all()

		const hasNext = rows.length > input.pageSize
		const companies = rows.slice(0, input.pageSize)

		return ok({ companies, hasNext })
	} catch (e) {
		return errFrom(
			`Error listing companies: ${e instanceof Error ? e.message : String(e)}`,
		)
	}
}
