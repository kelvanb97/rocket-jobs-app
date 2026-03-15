import type { Database } from "@aja-app/supabase"
import { errFrom, ok, type TResult } from "@aja-core/result"
import { supabaseAdminClient } from "@aja-core/supabase-next-auth/admin"
import { unmarshalInteraction } from "#schema/interaction-marshallers"
import type {
	TCreateInteraction,
	TInteraction,
} from "#schema/interaction-schema"

export async function createInteraction(
	input: TCreateInteraction,
): Promise<TResult<TInteraction>> {
	const supabase = supabaseAdminClient<Database>()

	const { data, error } = await supabase
		.schema("app")
		.from("interaction")
		.insert({
			role_id: input.roleId ?? null,
			person_id: input.personId ?? null,
			type: input.type,
			notes: input.notes ?? null,
		})
		.select()
		.single()

	if (error) return errFrom(`Error creating interaction: ${error.message}`)

	return ok(unmarshalInteraction(data))
}
