import type { Database } from "@aja-app/supabase"
import { errFrom, ok, type TResult } from "@aja-core/result"
import { supabaseAdminClient } from "@aja-core/supabase-next-auth/admin"
import { unmarshalRole } from "#schema/role-marshallers"
import type { TRole } from "#schema/role-schema"

export async function getRole(id: string): Promise<TResult<TRole>> {
	const supabase = supabaseAdminClient<Database>()

	const { data, error } = await supabase
		.schema("app")
		.from("role")
		.select()
		.eq("id", id)
		.single()

	if (error) return errFrom(`Error fetching role: ${error.message}`)

	return ok(unmarshalRole(data))
}
