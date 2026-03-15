import type { Database } from "@aja-app/supabase"
import { supabaseServerClient } from "@aja-core/supabase-next-auth/admin"
import { type TResult, errFrom, ok } from "@aja-core/result"
import type { TApplication } from "#schema/application-schema"
import { unmarshalApplication } from "#schema/application-marshallers"

export async function getApplication(
	id: string,
): Promise<TResult<TApplication>> {
	const supabase = await supabaseServerClient<Database>()

	const { data, error } = await supabase
		.schema("app")
		.from("application")
		.select()
		.eq("id", id)
		.single()

	if (error) return errFrom(`Error fetching application: ${error.message}`)

	return ok(unmarshalApplication(data))
}
