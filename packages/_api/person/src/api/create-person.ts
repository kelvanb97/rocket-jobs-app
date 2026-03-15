import type { Database } from "@aja-app/supabase"
import { errFrom, ok, type TResult } from "@aja-core/result"
import { supabaseAdminClient } from "@aja-core/supabase-next-auth/admin"
import { unmarshalPerson } from "#schema/person-marshallers"
import type { TCreatePerson, TPerson } from "#schema/person-schema"

export async function createPerson(
	input: TCreatePerson,
): Promise<TResult<TPerson>> {
	const supabase = supabaseAdminClient<Database>()

	const { data, error } = await supabase
		.schema("app")
		.from("person")
		.insert({
			company_id: input.companyId ?? null,
			name: input.name,
			title: input.title ?? null,
			email: input.email ?? null,
			linkedin_url: input.linkedinUrl ?? null,
			notes: input.notes ?? null,
		})
		.select()
		.single()

	if (error) return errFrom(`Error creating person: ${error.message}`)

	return ok(unmarshalPerson(data))
}
