import type { Database } from "@aja-app/supabase"
import { supabaseAdminClient } from "@aja-core/supabase/admin"
import { type TResult, errFrom, ok } from "@aja-core/result"
import type { TRole, TUpdateRole } from "#schema/role-schema"
import { unmarshalRole } from "#schema/role-marshallers"

export async function updateRole(
	input: TUpdateRole,
): Promise<TResult<TRole>> {
	const supabase = supabaseAdminClient<Database>()

	type RoleUpdate = Database["app"]["Tables"]["role"]["Update"]
	const updates: RoleUpdate = {}
	if (input.companyId !== undefined) updates["company_id"] = input.companyId
	if (input.title !== undefined) updates["title"] = input.title
	if (input.url !== undefined) updates["url"] = input.url
	if (input.description !== undefined) updates["description"] = input.description
	if (input.source !== undefined) updates["source"] = input.source
	if (input.locationType !== undefined) updates["location_type"] = input.locationType
	if (input.location !== undefined) updates["location"] = input.location
	if (input.salaryMin !== undefined) updates["salary_min"] = input.salaryMin
	if (input.salaryMax !== undefined) updates["salary_max"] = input.salaryMax
	if (input.status !== undefined) updates["status"] = input.status
	if (input.postedAt !== undefined) updates["posted_at"] = input.postedAt
	if (input.notes !== undefined) updates["notes"] = input.notes

	const { data, error } = await supabase
		.schema("app")
		.from("role")
		.update(updates)
		.eq("id", input.id)
		.select()
		.single()

	if (error) return errFrom(`Error updating role: ${error.message}`)

	return ok(unmarshalRole(data))
}
