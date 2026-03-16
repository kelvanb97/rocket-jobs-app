import type { Database } from "@aja-app/supabase"
import { errFrom, ok, type TResult } from "@aja-core/result"
import { supabaseAdminClient } from "@aja-core/supabase/admin"
import { unmarshalCompany } from "#schema/company-marshallers"
import type { TCompany, TCreateCompany } from "#schema/company-schema"

export async function createCompany(
	input: TCreateCompany,
): Promise<TResult<TCompany>> {
	const supabase = supabaseAdminClient<Database>()

	const { data, error } = await supabase
		.schema("app")
		.from("company")
		.insert({
			name: input.name,
			website: input.website ?? null,
			linkedin_url: input.linkedinUrl ?? null,
			size: input.size ?? null,
			stage: input.stage ?? null,
			industry: input.industry ?? null,
			notes: input.notes ?? null,
		})
		.select()
		.single()

	if (error) return errFrom(`Error creating company: ${error.message}`)

	return ok(unmarshalCompany(data))
}
