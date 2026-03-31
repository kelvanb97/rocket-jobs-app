import { role } from "@rja-app/drizzle"
import { db } from "@rja-core/drizzle"
import { errFrom, ok, type TResult } from "@rja-core/result"
import type { TRole, TUpdateRole } from "#schema/role-schema"
import { eq } from "drizzle-orm"

export function updateRole(input: TUpdateRole): TResult<TRole> {
	try {
		const result = db()
			.update(role)
			.set(input)
			.where(eq(role.id, input.id))
			.returning()
			.get()
		if (!result) return errFrom("Role not found")
		return ok(result)
	} catch (e) {
		return errFrom(
			`Error updating role: ${e instanceof Error ? e.message : String(e)}`,
		)
	}
}
