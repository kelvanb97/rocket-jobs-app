import type { Database } from "@aja-app/supabase"
import { errFrom, ok, type TResult } from "@aja-core/result"
import { supabaseAdminClient } from "@aja-core/supabase/admin"

export async function unlinkRolePerson(
	roleId: string,
	personId: string,
): Promise<TResult<{ roleId: string; personId: string }>> {
	const supabase = supabaseAdminClient<Database>()

	const { error } = await supabase
		.schema("app")
		.from("role_person")
		.delete()
		.eq("role_id", roleId)
		.eq("person_id", personId)

	if (error) return errFrom(`Error unlinking role-person: ${error.message}`)

	return ok({ roleId, personId })
}
