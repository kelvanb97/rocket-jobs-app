import { role, score } from "@rja-app/drizzle"
import { db } from "@rja-core/drizzle"
import { errFrom, ok, type TResult } from "@rja-core/result"
import type { TRole } from "#schema/role-schema"
import { desc, eq, getTableColumns, isNull } from "drizzle-orm"

export function listUnscoredRoles(): TResult<TRole[]> {
	try {
		const results = db()
			.select({ ...getTableColumns(role) })
			.from(role)
			.leftJoin(score, eq(role.id, score.roleId))
			.where(isNull(score.id))
			.orderBy(desc(role.createdAt))
			.all()
		return ok(results)
	} catch (e) {
		return errFrom(
			`Error listing unscored roles: ${e instanceof Error ? e.message : String(e)}`,
		)
	}
}
