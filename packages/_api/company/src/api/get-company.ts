import type { Database } from "@aja-app/supabase"
import { errFrom, ok, type TResult } from "@aja-core/result"
import { supabaseAdminClient } from "@aja-core/supabase-next-auth/admin"
import { unmarshalCompany } from "#schema/company-marshallers"
import type { TCompany } from "#schema/company-schema"

export async function getCompany(id: string): Promise<TResult<TCompany>> {
	const supabase = supabaseAdminClient<Database>()

	const { data, error } = await supabase
		.schema("app")
		.from("company")
		.select()
		.eq("id", id)
		.single()

	if (error) return errFrom(`Error fetching company: ${error.message}`)

	return ok(unmarshalCompany(data))
}
