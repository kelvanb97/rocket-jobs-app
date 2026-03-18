import type { Database } from "@aja-app/supabase"
import { errFrom, ok, type TResult } from "@aja-core/result"
import { supabaseAdminClient } from "@aja-core/supabase/admin"
import { unmarshalScore } from "#schema/score-marshallers"
import type { TScore } from "#schema/score-schema"

export async function listScoresByRoles(
	roleIds: string[],
): Promise<TResult<TScore[]>> {
	if (roleIds.length === 0) return ok([])

	const supabase = supabaseAdminClient<Database>()

	const { data, error } = await supabase
		.schema("app")
		.from("score")
		.select()
		.in("role_id", roleIds)

	if (error) return errFrom(`Error listing scores: ${error.message}`)

	return ok(data.map(unmarshalScore))
}
