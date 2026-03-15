import type { Database } from "@aja-app/supabase"
import { errFrom, ok, type TResult } from "@aja-core/result"
import { supabaseAdminClient } from "@aja-core/supabase-next-auth/admin"
import { unmarshalRolePerson } from "#schema/role-person-marshallers"
import type { TRolePerson, TUpdateRolePerson } from "#schema/role-person-schema"

export async function updateRolePerson(
	input: TUpdateRolePerson,
): Promise<TResult<TRolePerson>> {
	const supabase = supabaseAdminClient<Database>()

	const { data, error } = await supabase
		.schema("app")
		.from("role_person")
		.update({ relationship: input.relationship })
		.eq("role_id", input.roleId)
		.eq("person_id", input.personId)
		.select()
		.single()

	if (error) return errFrom(`Error updating role-person: ${error.message}`)

	return ok(unmarshalRolePerson(data))
}
