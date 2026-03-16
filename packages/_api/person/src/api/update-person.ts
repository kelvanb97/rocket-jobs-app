import type { Database } from "@aja-app/supabase"
import { supabaseAdminClient } from "@aja-core/supabase/admin"
import { type TResult, errFrom, ok } from "@aja-core/result"
import type { TPerson, TUpdatePerson } from "#schema/person-schema"
import { unmarshalPerson } from "#schema/person-marshallers"

export async function updatePerson(
	input: TUpdatePerson,
): Promise<TResult<TPerson>> {
	const supabase = supabaseAdminClient<Database>()

	type PersonUpdate = Database["app"]["Tables"]["person"]["Update"]
	const updates: PersonUpdate = {}
	if (input.companyId !== undefined) updates["company_id"] = input.companyId
	if (input.name !== undefined) updates["name"] = input.name
	if (input.title !== undefined) updates["title"] = input.title
	if (input.email !== undefined) updates["email"] = input.email
	if (input.linkedinUrl !== undefined) updates["linkedin_url"] = input.linkedinUrl
	if (input.notes !== undefined) updates["notes"] = input.notes

	const { data, error } = await supabase
		.schema("app")
		.from("person")
		.update(updates)
		.eq("id", input.id)
		.select()
		.single()

	if (error) return errFrom(`Error updating person: ${error.message}`)

	return ok(unmarshalPerson(data))
}
