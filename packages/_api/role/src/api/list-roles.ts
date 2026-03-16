import type { Database } from "@aja-app/supabase"
import { errFrom, ok, type TResult } from "@aja-core/result"
import { supabaseAdminClient } from "@aja-core/supabase/admin"
import { unmarshalRole } from "#schema/role-marshallers"
import type { TListRoles, TRole } from "#schema/role-schema"

export async function listRoles(
	input: TListRoles,
): Promise<TResult<{ roles: TRole[]; hasNext: boolean }>> {
	const supabase = supabaseAdminClient<Database>()

	const start = (input.page - 1) * input.pageSize
	const end = start + input.pageSize

	let query = supabase.schema("app").from("role").select()

	if (input.search) {
		query = query.ilike("title", `%${input.search}%`)
	}
	if (input.companyId) {
		query = query.eq("company_id", input.companyId)
	}
	if (input.status) {
		query = query.eq("status", input.status)
	}
	if (input.locationType) {
		query = query.eq("location_type", input.locationType)
	}
	if (input.source) {
		query = query.eq("source", input.source)
	}

	const sortColumn = input.sortBy ?? "created_at"
	const ascending = (input.sortOrder ?? "desc") === "asc"

	const { data, error } = await query
		.order(sortColumn, { ascending })
		.range(start, end)

	if (error) return errFrom(`Error listing roles: ${error.message}`)

	const hasNext = data.length > input.pageSize
	const roles = data.slice(0, input.pageSize).map(unmarshalRole)

	return ok({ roles, hasNext })
}
