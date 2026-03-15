import type { Database } from "@aja-app/supabase"
import { errFrom, ok, type TResult } from "@aja-core/result"
import { supabaseAdminClient } from "@aja-core/supabase-next-auth/admin"
import { unmarshalRolePerson } from "#schema/role-person-marshallers"
import type { TRolePerson } from "#schema/role-person-schema"

export async function listPersonsByRole(
	roleId: string,
): Promise<TResult<TRolePerson[]>> {
	const supabase = supabaseAdminClient<Database>()

	const { data, error } = await supabase
		.schema("app")
		.from("role_person")
		.select()
		.eq("role_id", roleId)

	if (error) return errFrom(`Error listing persons by role: ${error.message}`)

	return ok(data.map(unmarshalRolePerson))
}
