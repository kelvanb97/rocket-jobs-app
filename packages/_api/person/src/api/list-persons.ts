import { person } from "@aja-app/drizzle"
import { db } from "@aja-core/drizzle"
import { errFrom, ok, type TResult } from "@aja-core/result"
import type { TListPersons, TPerson } from "#schema/person-schema"
import { and, desc, eq, like } from "drizzle-orm"

export function listPersons(
	input: TListPersons,
): TResult<{ persons: TPerson[]; hasNext: boolean }> {
	try {
		const conditions = []

		if (input.search) {
			conditions.push(like(person.name, `%${input.search}%`))
		}
		if (input.email) {
			conditions.push(like(person.email, `%${input.email}%`))
		}
		if (input.companyId) {
			conditions.push(eq(person.companyId, input.companyId))
		}

		const offset = (input.page - 1) * input.pageSize

		const rows = db()
			.select()
			.from(person)
			.where(conditions.length > 0 ? and(...conditions) : undefined)
			.orderBy(desc(person.createdAt), person.id)
			.limit(input.pageSize + 1)
			.offset(offset)
			.all()

		const hasNext = rows.length > input.pageSize
		const persons = rows.slice(0, input.pageSize)

		return ok({ persons, hasNext })
	} catch (e) {
		return errFrom(
			`Error listing persons: ${e instanceof Error ? e.message : String(e)}`,
		)
	}
}
