import { rolePerson } from "@aja-app/drizzle"
import { db } from "@aja-core/drizzle"
import { errFrom, ok, type TResult } from "@aja-core/result"
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
