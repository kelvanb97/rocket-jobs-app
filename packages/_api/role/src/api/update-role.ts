import type { Database } from "@aja-app/supabase"
import { errFrom, ok, type TResult } from "@aja-core/result"
import { supabaseAdminClient } from "@aja-core/supabase/admin"
import { marshalUpdateRole, unmarshalRole } from "#schema/role-marshallers"
import type { TRole, TUpdateRole } from "#schema/role-schema"

export async function updateRole(input: TUpdateRole): Promise<TResult<TRole>> {
	const supabase = supabaseAdminClient<Database>()

	const { data, error } = await supabase
		.schema("app")
		.from("role")
		.update(marshalUpdateRole(input))
		.eq("id", input.id)
		.select()
		.single()

	if (error) return errFrom(`Error updating role: ${error.message}`)

	return ok(unmarshalRole(data))
}
