import type { Database } from "@aja-app/supabase"
import { errFrom, ok, type TResult } from "@aja-core/result"
import { supabaseAdminClient } from "@aja-core/supabase/admin"
import { unmarshalRole } from "#schema/role-marshallers"
import type { TRole } from "#schema/role-schema"

export async function listUnscoredRoles(): Promise<TResult<TRole[]>> {
	const supabase = supabaseAdminClient<Database>()

	const { data: scoredRows, error: scoredError } = await supabase
		.schema("app")
		.from("score")
		.select("role_id")

	if (scoredError)
		return errFrom(`Error fetching scored role IDs: ${scoredError.message}`)

	const scoredIds = scoredRows
		.map((r) => r.role_id)
		.filter((id): id is string => id !== null)

	let query = supabase.schema("app").from("role").select()

	if (scoredIds.length > 0) {
		query = query.not("id", "in", `(${scoredIds.join(",")})`)
	}

	const { data, error } = await query.order("created_at", {
		ascending: false,
	})

	if (error) return errFrom(`Error listing unscored roles: ${error.message}`)

	return ok(data.map(unmarshalRole))
}
