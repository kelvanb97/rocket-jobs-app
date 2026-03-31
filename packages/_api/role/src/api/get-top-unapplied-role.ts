import { role, score } from "@rja-app/drizzle"
import { db } from "@rja-core/drizzle"
import { errFrom, ok, type TResult } from "@rja-core/result"
import type { TRole } from "#schema/role-schema"
import { desc, eq, getTableColumns } from "drizzle-orm"

export type TRoleWithScore = TRole & { score: number }

export function getTopUnappliedRole(): TResult<TRoleWithScore | null> {
	try {
		const result = db()
			.select({ ...getTableColumns(role), scoreValue: score.score })
			.from(role)
			.innerJoin(score, eq(role.id, score.roleId))
			.where(eq(role.status, "pending"))
			.orderBy(desc(score.score))
			.limit(1)
			.get()

		if (!result) return ok(null)

		const { scoreValue, ...roleFields } = result
		return ok({ ...roleFields, score: scoreValue })
	} catch (e) {
		return errFrom(
			`Error fetching top unapplied role: ${e instanceof Error ? e.message : String(e)}`,
		)
	}
}
