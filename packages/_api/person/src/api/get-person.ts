import type { Database } from "@aja-app/supabase"
import { errFrom, ok, type TResult } from "@aja-core/result"
import { supabaseAdminClient } from "@aja-core/supabase-next-auth/admin"
import { unmarshalPerson } from "#schema/person-marshallers"
import type { TPerson } from "#schema/person-schema"

export async function getPerson(id: string): Promise<TResult<TPerson>> {
	const supabase = supabaseAdminClient<Database>()

	const { data, error } = await supabase
		.schema("app")
		.from("person")
		.select()
		.eq("id", id)
		.single()

	if (error) return errFrom(`Error fetching person: ${error.message}`)

	return ok(unmarshalPerson(data))
}
