import { rolePerson } from "@rja-app/drizzle"
import { db } from "@rja-core/drizzle"
import { errFrom, ok, type TResult } from "@rja-core/result"
import type { TLinkRolePerson, TRolePerson } from "#schema/role-person-schema"

export function linkRolePerson(input: TLinkRolePerson): TResult<TRolePerson> {
	try {
		const row = db().insert(rolePerson).values(input).returning().get()
		return ok(row)
	} catch (e) {
		return errFrom(
			`Error linking role-person: ${e instanceof Error ? e.message : String(e)}`,
		)
	}
}
