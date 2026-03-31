import { role } from "@rja-app/drizzle"
import { db } from "@rja-core/drizzle"
import { errFrom, ok, type TResult } from "@rja-core/result"
import type { TRole } from "#schema/role-schema"
import { eq } from "drizzle-orm"

export function getRole(id: number): TResult<TRole> {
	try {
		const result = db().select().from(role).where(eq(role.id, id)).get()
		if (!result) return errFrom("Role not found")
		return ok(result)
	} catch (e) {
		return errFrom(
			`Error fetching role: ${e instanceof Error ? e.message : String(e)}`,
		)
	}
}
