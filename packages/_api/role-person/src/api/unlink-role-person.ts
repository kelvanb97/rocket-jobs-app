import { rolePerson } from "@rja-app/drizzle"
import { db } from "@rja-core/drizzle"
import { errFrom, ok, type TResult } from "@rja-core/result"
import { and, eq } from "drizzle-orm"

export function unlinkRolePerson(
	roleId: number,
	personId: number,
): TResult<{ roleId: number; personId: number }> {
	try {
		db()
			.delete(rolePerson)
			.where(
				and(
					eq(rolePerson.roleId, roleId),
					eq(rolePerson.personId, personId),
				),
			)
			.run()
		return ok({ roleId, personId })
	} catch (e) {
		return errFrom(
			`Error unlinking role-person: ${e instanceof Error ? e.message : String(e)}`,
		)
	}
}
