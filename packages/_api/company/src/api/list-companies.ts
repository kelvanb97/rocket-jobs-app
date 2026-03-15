import type { Database } from "@aja-app/supabase"
import { supabaseServerClient } from "@aja-core/supabase-next-auth/admin"
import { type TResult, errFrom, ok } from "@aja-core/result"
import type { TCompany, TListCompanies } from "#schema/company-schema"
import { unmarshalCompany } from "#schema/company-marshallers"

export async function listCompanies(
	input: TListCompanies,
): Promise<TResult<{ companies: TCompany[]; hasNext: boolean }>> {
	const supabase = await supabaseServerClient<Database>()

	const start = (input.page - 1) * input.pageSize
	const end = start + input.pageSize

	let query = supabase
		.schema("app")
		.from("company")
		.select()

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

	const { data, error } = await query.range(start, end)

	if (error) return errFrom(`Error listing companies: ${error.message}`)

	const hasNext = data.length > input.pageSize
	const companies = data.slice(0, input.pageSize).map(unmarshalCompany)

	return ok({ companies, hasNext })
}
