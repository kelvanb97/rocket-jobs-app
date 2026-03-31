import { rolePerson } from "@rja-app/drizzle"
import { db } from "@rja-core/drizzle"
import { errFrom, ok, type TResult } from "@rja-core/result"
import type { TRolePerson } from "#schema/role-person-schema"
import { eq } from "drizzle-orm"

export function listPersonsByRole(roleId: number): TResult<TRolePerson[]> {
	try {
		const rows = db()
			.select()
			.from(rolePerson)
			.where(eq(rolePerson.roleId, roleId))
			.all()
		return ok(rows)
	} catch (e) {
		return errFrom(
			`Error listing persons by role: ${e instanceof Error ? e.message : String(e)}`,
		)
	}
}
