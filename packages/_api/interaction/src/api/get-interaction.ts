import type { Database } from "@aja-app/supabase"
import { errFrom, ok, type TResult } from "@aja-core/result"
import { supabaseAdminClient } from "@aja-core/supabase/admin"
import { unmarshalInteraction } from "#schema/interaction-marshallers"
import type { TInteraction } from "#schema/interaction-schema"

export async function getInteraction(
	id: string,
): Promise<TResult<TInteraction>> {
	const supabase = supabaseAdminClient<Database>()

	const { data, error } = await supabase
		.schema("app")
		.from("interaction")
		.select()
		.eq("id", id)
		.single()

	if (error) return errFrom(`Error fetching interaction: ${error.message}`)

	return ok(unmarshalInteraction(data))
}
