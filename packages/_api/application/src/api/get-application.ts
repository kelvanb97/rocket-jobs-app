import type { Database } from "@aja-app/supabase"
import { errFrom, ok, type TResult } from "@aja-core/result"
import { supabaseAdminClient } from "@aja-core/supabase-next-auth/admin"
import { unmarshalApplication } from "#schema/application-marshallers"
import type { TApplication } from "#schema/application-schema"

export async function getApplication(
	id: string,
): Promise<TResult<TApplication>> {
	const supabase = supabaseAdminClient<Database>()

	const { data, error } = await supabase
		.schema("app")
		.from("application")
		.select()
		.eq("id", id)
		.single()

	if (error) return errFrom(`Error fetching application: ${error.message}`)

	return ok(unmarshalApplication(data))
}
