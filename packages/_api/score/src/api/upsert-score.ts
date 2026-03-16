import type { Database } from "@aja-app/supabase"
import { errFrom, ok, type TResult } from "@aja-core/result"
import { supabaseAdminClient } from "@aja-core/supabase/admin"
import { unmarshalScore } from "#schema/score-marshallers"
import type { TScore, TUpsertScore } from "#schema/score-schema"

export async function upsertScore(
	input: TUpsertScore,
): Promise<TResult<TScore>> {
	const supabase = supabaseAdminClient<Database>()

	const { data, error } = await supabase
		.schema("app")
		.from("score")
		.upsert(
			{
				role_id: input.roleId,
				score: input.score,
				positive: input.positive ?? null,
				negative: input.negative ?? null,
			},
			{ onConflict: "role_id" },
		)
		.select()
		.single()

	if (error) return errFrom(`Error upserting score: ${error.message}`)

	return ok(unmarshalScore(data))
}
