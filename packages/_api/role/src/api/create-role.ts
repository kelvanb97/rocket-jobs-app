import { role } from "@rja-app/drizzle"
import { db } from "@rja-core/drizzle"
import { errFrom, ok, type TResult } from "@rja-core/result"
import type { TCreateRole, TRole } from "#schema/role-schema"

export function createRole(input: TCreateRole): TResult<TRole> {
	try {
		const result = db()
			.insert(role)
			.values({ ...input, status: input.status ?? "pending" })
			.returning()
			.get()
		return ok(result)
	} catch (e) {
		return errFrom(
			`Error creating role: ${e instanceof Error ? e.message : String(e)}`,
		)
	}
}
