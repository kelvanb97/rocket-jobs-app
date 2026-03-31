import { score } from "@rja-app/drizzle"
import { db } from "@rja-core/drizzle"
import { errFrom, ok, type TResult } from "@rja-core/result"
import type { TScore, TUpsertScore } from "#schema/score-schema"

export function upsertScore(input: TUpsertScore): TResult<TScore> {
	try {
		const result = db()
			.insert(score)
			.values({
				roleId: input.roleId,
				score: input.score,
				positive: input.positive,
				negative: input.negative,
			})
			.onConflictDoUpdate({
				target: score.roleId,
				set: {
					score: input.score,
					positive: input.positive,
					negative: input.negative,
				},
			})
			.returning()
			.get()
		return ok(result)
	} catch (e) {
		return errFrom(
			`Error upserting score: ${e instanceof Error ? e.message : String(e)}`,
		)
	}
}
