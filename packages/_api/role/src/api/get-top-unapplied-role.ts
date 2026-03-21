import type { Database } from "@aja-app/supabase"
import { errFrom, ok, type TResult } from "@aja-core/result"
import { supabaseAdminClient } from "@aja-core/supabase/admin"
import { unmarshalRole } from "#schema/role-marshallers"
import type { TRole } from "#schema/role-schema"

export type TRoleWithScore = TRole & { score: number }

export async function getTopUnappliedRole(): Promise<
	TResult<TRoleWithScore | null>
> {
	const supabase = supabaseAdminClient<Database>()

	// Get all role IDs that already have applications
	const { data: appliedRows, error: appliedError } = await supabase
		.schema("app")
		.from("application")
		.select("role_id")

	if (appliedError)
		return errFrom(
			`Error fetching applied role IDs: ${appliedError.message}`,
		)

	const appliedIds = appliedRows
		.map((r) => r.role_id)
		.filter((id): id is string => id !== null)

	// Get all scores ordered by score descending
	let scoreQuery = supabase
		.schema("app")
		.from("score")
		.select("role_id, score")
		.order("score", { ascending: false })

	if (appliedIds.length > 0) {
		scoreQuery = scoreQuery.not(
			"role_id",
			"in",
			`(${appliedIds.join(",")})`,
		)
	}

	const { data: scores, error: scoreError } = await scoreQuery.limit(1)

	if (scoreError)
		return errFrom(`Error fetching top score: ${scoreError.message}`)

	if (scores.length === 0) return ok(null)

	const topScore = scores[0]!
	if (!topScore.role_id) return ok(null)

	// Fetch the full role
	const { data: roleRow, error: roleError } = await supabase
		.schema("app")
		.from("role")
		.select()
		.eq("id", topScore.role_id)
		.single()

	if (roleError) return errFrom(`Error fetching role: ${roleError.message}`)

	return ok({
		...unmarshalRole(roleRow),
		score: topScore.score,
	})
}
