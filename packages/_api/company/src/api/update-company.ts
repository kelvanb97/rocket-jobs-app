import type { Database } from "@aja-app/supabase"
import { supabaseAdminClient } from "@aja-core/supabase/admin"
import { type TResult, errFrom, ok } from "@aja-core/result"
import type { TCompany, TUpdateCompany } from "#schema/company-schema"
import { unmarshalCompany } from "#schema/company-marshallers"

export async function updateCompany(
	input: TUpdateCompany,
): Promise<TResult<TCompany>> {
	const supabase = supabaseAdminClient<Database>()

	type CompanyUpdate = Database["app"]["Tables"]["company"]["Update"]
	const updates: CompanyUpdate = {}
	if (input.name !== undefined) updates["name"] = input.name
	if (input.website !== undefined) updates["website"] = input.website
	if (input.linkedinUrl !== undefined) updates["linkedin_url"] = input.linkedinUrl
	if (input.size !== undefined) updates["size"] = input.size
	if (input.stage !== undefined) updates["stage"] = input.stage
	if (input.industry !== undefined) updates["industry"] = input.industry
	if (input.notes !== undefined) updates["notes"] = input.notes

	const { data, error } = await supabase
		.schema("app")
		.from("company")
		.update(updates)
		.eq("id", input.id)
		.select()
		.single()

	if (error) return errFrom(`Error updating company: ${error.message}`)

	return ok(unmarshalCompany(data))
}
