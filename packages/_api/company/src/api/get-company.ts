import type { Database } from "@aja-app/supabase"
import { supabaseServerClient } from "@aja-core/supabase-next-auth/admin"
import { type TResult, errFrom, ok } from "@aja-core/result"
import type { TCompany } from "#schema/company-schema"
import { unmarshalCompany } from "#schema/company-marshallers"

export async function getCompany(
	id: string,
): Promise<TResult<TCompany>> {
	const supabase = await supabaseServerClient<Database>()

	const { data, error } = await supabase
		.schema("app")
		.from("company")
		.select()
		.eq("id", id)
		.single()

	if (error) return errFrom(`Error fetching company: ${error.message}`)

	return ok(unmarshalCompany(data))
}
