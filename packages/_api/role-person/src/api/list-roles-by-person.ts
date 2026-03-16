import type { Database } from "@aja-app/supabase"
import { errFrom, ok, type TResult } from "@aja-core/result"
import { supabaseAdminClient } from "@aja-core/supabase/admin"
import { unmarshalRolePerson } from "#schema/role-person-marshallers"
import type { TRolePerson } from "#schema/role-person-schema"

export async function listRolesByPerson(
	personId: string,
): Promise<TResult<TRolePerson[]>> {
	const supabase = supabaseAdminClient<Database>()

	const { data, error } = await supabase
		.schema("app")
		.from("role_person")
		.select()
		.eq("person_id", personId)

	if (error) return errFrom(`Error listing roles by person: ${error.message}`)

	return ok(data.map(unmarshalRolePerson))
}
