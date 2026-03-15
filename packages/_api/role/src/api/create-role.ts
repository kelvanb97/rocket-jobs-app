import type { Database } from "@aja-app/supabase"
import { errFrom, ok, type TResult } from "@aja-core/result"
import { supabaseAdminClient } from "@aja-core/supabase-next-auth/admin"
import { unmarshalRole } from "#schema/role-marshallers"
import type { TCreateRole, TRole } from "#schema/role-schema"

export async function createRole(input: TCreateRole): Promise<TResult<TRole>> {
	const supabase = supabaseAdminClient<Database>()

	const { data, error } = await supabase
		.schema("app")
		.from("role")
		.insert({
			company_id: input.companyId ?? null,
			title: input.title,
			url: input.url ?? null,
			description: input.description ?? null,
			source: input.source ?? null,
			location_type: input.locationType ?? null,
			location: input.location ?? null,
			salary_min: input.salaryMin ?? null,
			salary_max: input.salaryMax ?? null,
			status: input.status,
			posted_at: input.postedAt ?? null,
			notes: input.notes ?? null,
		})
		.select()
		.single()

	if (error) return errFrom(`Error creating role: ${error.message}`)

	return ok(unmarshalRole(data))
}
