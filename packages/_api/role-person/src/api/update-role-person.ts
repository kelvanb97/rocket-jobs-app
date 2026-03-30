import { rolePerson } from "@aja-app/drizzle"
import { db } from "@aja-core/drizzle"
import { errFrom, ok, type TResult } from "@aja-core/result"
import type { TRolePerson, TUpdateRolePerson } from "#schema/role-person-schema"
import { and, eq } from "drizzle-orm"

export function updateRolePerson(
	input: TUpdateRolePerson,
): TResult<TRolePerson> {
	try {
		const row = db()
			.update(rolePerson)
			.set({ relationship: input.relationship })
			.where(
				and(
					eq(rolePerson.roleId, input.roleId),
					eq(rolePerson.personId, input.personId),
				),
			)
			.returning()
			.get()
		if (!row)
			return errFrom(
				`Role-person not found: ${input.roleId}-${input.personId}`,
			)
		return ok(row)
	} catch (e) {
		return errFrom(
			`Error updating role-person: ${e instanceof Error ? e.message : String(e)}`,
		)
	}
}
