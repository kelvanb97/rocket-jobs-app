import { scoringConfig } from "@rja-app/drizzle"
import type { TScoringConfig } from "@rja-app/drizzle"
import { db } from "@rja-core/drizzle"
import { errFrom, ok, type TResult } from "@rja-core/result"
import type { TUpsertScoringConfig } from "#schema/scoring-config-schema"

export function upsertScoringConfig(
	input: TUpsertScoringConfig,
): TResult<TScoringConfig> {
	try {
		const result = db()
			.insert(scoringConfig)
			.values(input)
			.onConflictDoUpdate({
				target: scoringConfig.userProfileId,
				set: {
					titleAndSeniority: input.titleAndSeniority,
					skills: input.skills,
					salary: input.salary,
					location: input.location,
					industry: input.industry,
				},
			})
			.returning()
			.get()
		return ok(result)
	} catch (e) {
		return errFrom(
			`Error upserting scoring config: ${e instanceof Error ? e.message : String(e)}`,
		)
	}
}
