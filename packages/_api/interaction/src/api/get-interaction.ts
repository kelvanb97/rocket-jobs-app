import type { Database } from "@aja-app/supabase"
import { supabaseServerClient } from "@aja-core/supabase-next-auth/admin"
import { type TResult, errFrom, ok } from "@aja-core/result"
import type { TInteraction } from "#schema/interaction-schema"
import { unmarshalInteraction } from "#schema/interaction-marshallers"

export async function getInteraction(
	id: string,
): Promise<TResult<TInteraction>> {
	const supabase = await supabaseServerClient<Database>()

	const { data, error } = await supabase
		.schema("app")
		.from("interaction")
		.select()
		.eq("id", id)
		.single()

	if (error) return errFrom(`Error fetching interaction: ${error.message}`)

	return ok(unmarshalInteraction(data))
}
