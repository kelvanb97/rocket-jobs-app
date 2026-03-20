import type { Database } from "@aja-app/supabase"
import { errFrom, ok, type TResult } from "@aja-core/result"
import { supabaseAdminClient } from "@aja-core/supabase/admin"
import { unmarshalCompany } from "#schema/company-marshallers"
import type { TCompany, TListCompanies } from "#schema/company-schema"

export async function listCompanies(
	input: TListCompanies,
): Promise<TResult<{ companies: TCompany[]; hasNext: boolean }>> {
	const supabase = supabaseAdminClient<Database>()

	const start = (input.page - 1) * input.pageSize
	const end = start + input.pageSize

	let query = supabase.schema("app").from("company").select()

	if (input.search) {
		query = query.ilike("name", `%${input.search}%`)
	}
	if (input.industry) {
		query = query.eq("industry", input.industry)
	}
	if (input.stage) {
		query = query.eq("stage", input.stage)
	}
	if (input.size) {
		query = query.eq("size", input.size)
	}

	const { data, error } = await query
		.order("created_at", { ascending: false })
		.order("id")
		.range(start, end)

	if (error) return errFrom(`Error listing companies: ${error.message}`)

	const hasNext = data.length > input.pageSize
	const companies = data.slice(0, input.pageSize).map(unmarshalCompany)

	return ok({ companies, hasNext })
}
