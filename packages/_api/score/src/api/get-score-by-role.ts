import { score } from "@rja-app/drizzle"
import { db } from "@rja-core/drizzle"
import { errFrom, ok, type TResult } from "@rja-core/result"
import type { TScore } from "#schema/score-schema"
import { eq } from "drizzle-orm"

export function getScoreByRole(roleId: number): TResult<TScore | null> {
	try {
		const row = db()
			.select()
			.from(score)
			.where(eq(score.roleId, roleId))
			.get()
		return ok(row ?? null)
	} catch (e) {
		return errFrom(
			`Error fetching score: ${e instanceof Error ? e.message : String(e)}`,
		)
	}
}
