import type { Database } from "@aja-app/supabase"
import { errFrom, ok, type TResult } from "@aja-core/result"
import { supabaseAdminClient } from "@aja-core/supabase/admin"
import { unmarshalRole } from "#schema/role-marshallers"
import type { TRole } from "#schema/role-schema"

const POSTGREST_NO_ROWS = "PGRST116"

export type TRoleWithScore = TRole & { score: number }

export async function getTopUnappliedRole(): Promise<
	TResult<TRoleWithScore | null>
> {
	const supabase = supabaseAdminClient<Database>()

	const { data, error } = await supabase
		.schema("app")
		.from("role")
		.select("*, score(score)")
		.eq("status", "pending")
		.not("score", "is", null)
		.order("score(score)", { ascending: false })
		.limit(1)
		.single()

	if (error) {
		if (error.code === POSTGREST_NO_ROWS) return ok(null)
		return errFrom(`Error fetching top unapplied role: ${error.message}`)
	}

	const { score, ...roleRow } = data
	if (score == null) return ok(null)

	return ok({
		...unmarshalRole(roleRow),
		score: score.score,
	})
}
