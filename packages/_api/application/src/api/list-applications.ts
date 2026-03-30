import { application } from "@aja-app/drizzle"
import { db } from "@aja-core/drizzle"
import { errFrom, ok, type TResult } from "@aja-core/result"
import type {
	TApplication,
	TListApplications,
} from "#schema/application-schema"
import { and, desc, eq } from "drizzle-orm"

export function listApplications(
	input: TListApplications,
): TResult<{ applications: TApplication[]; hasNext: boolean }> {
	try {
		const conditions = []

		if (input.roleId) {
			conditions.push(eq(application.roleId, input.roleId))
		}
		if (input.status) {
			conditions.push(eq(application.status, input.status))
		}

		const offset = (input.page - 1) * input.pageSize

		const rows = db()
			.select()
			.from(application)
			.where(conditions.length > 0 ? and(...conditions) : undefined)
			.orderBy(desc(application.createdAt), application.id)
			.limit(input.pageSize + 1)
			.offset(offset)
			.all()

		const hasNext = rows.length > input.pageSize
		const applications = rows.slice(0, input.pageSize)

		return ok({ applications, hasNext })
	} catch (e) {
		return errFrom(
			`Error listing applications: ${e instanceof Error ? e.message : String(e)}`,
		)
	}
}
