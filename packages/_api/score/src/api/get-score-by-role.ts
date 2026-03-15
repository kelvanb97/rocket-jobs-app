import type { Database } from "@aja-app/supabase"
import { errFrom, ok, type TResult } from "@aja-core/result"
import { supabaseAdminClient } from "@aja-core/supabase-next-auth/admin"
import { unmarshalScore } from "#schema/score-marshallers"
import type { TScore } from "#schema/score-schema"

export async function getScoreByRole(
	roleId: string,
): Promise<TResult<TScore | null>> {
	const supabase = supabaseAdminClient<Database>()

	const { data, error } = await supabase
		.schema("app")
		.from("score")
		.select()
		.eq("role_id", roleId)
		.maybeSingle()

	if (error) return errFrom(`Error fetching score: ${error.message}`)

	return ok(data ? unmarshalScore(data) : null)
}
