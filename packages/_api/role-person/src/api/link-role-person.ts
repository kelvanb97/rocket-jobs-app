import type { Database } from "@aja-app/supabase"
import { errFrom, ok, type TResult } from "@aja-core/result"
import { supabaseAdminClient } from "@aja-core/supabase-next-auth/admin"
import { unmarshalRolePerson } from "#schema/role-person-marshallers"
import type { TLinkRolePerson, TRolePerson } from "#schema/role-person-schema"

export async function linkRolePerson(
	input: TLinkRolePerson,
): Promise<TResult<TRolePerson>> {
	const supabase = supabaseAdminClient<Database>()

	const { data, error } = await supabase
		.schema("app")
		.from("role_person")
		.insert({
			role_id: input.roleId,
			person_id: input.personId,
			relationship: input.relationship ?? null,
		})
		.select()
		.single()

	if (error) return errFrom(`Error linking role-person: ${error.message}`)

	return ok(unmarshalRolePerson(data))
}
