import type { Database } from "@aja-app/supabase"
import { supabaseServerClient } from "@aja-core/supabase-next-auth/admin"
import { type TResult, errFrom, ok } from "@aja-core/result"
import type { TInteraction, TUpdateInteraction } from "#schema/interaction-schema"
import { unmarshalInteraction } from "#schema/interaction-marshallers"

export async function updateInteraction(
	input: TUpdateInteraction,
): Promise<TResult<TInteraction>> {
	const supabase = await supabaseServerClient<Database>()

	const updates: Record<string, unknown> = {}
	if (input.roleId !== undefined) updates.role_id = input.roleId
	if (input.personId !== undefined) updates.person_id = input.personId
	if (input.type !== undefined) updates.type = input.type
	if (input.notes !== undefined) updates.notes = input.notes

	const { data, error } = await supabase
		.schema("app")
		.from("interaction")
		.update(updates)
		.eq("id", input.id)
		.select()
		.single()

	if (error) return errFrom(`Error updating interaction: ${error.message}`)

	return ok(unmarshalInteraction(data))
}
