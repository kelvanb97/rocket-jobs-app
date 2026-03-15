import type { Database } from "@aja-app/supabase"
import { supabaseServerClient } from "@aja-core/supabase-next-auth/admin"
import { type TResult, errFrom, ok } from "@aja-core/result"
import type { TCompany, TCreateCompany } from "#schema/company-schema"
import { unmarshalCompany } from "#schema/company-marshallers"

export async function createCompany(
	input: TCreateCompany,
): Promise<TResult<TCompany>> {
	const supabase = await supabaseServerClient<Database>()

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
