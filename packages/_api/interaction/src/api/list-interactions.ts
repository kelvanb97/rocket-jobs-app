import type { Database } from "@aja-app/supabase"
import { supabaseServerClient } from "@aja-core/supabase-next-auth/admin"
import { type TResult, errFrom, ok } from "@aja-core/result"
import type { TInteraction, TListInteractions } from "#schema/interaction-schema"
import { unmarshalInteraction } from "#schema/interaction-marshallers"

export async function listInteractions(
	input: TListInteractions,
): Promise<TResult<{ interactions: TInteraction[]; hasNext: boolean }>> {
	const supabase = await supabaseServerClient<Database>()

	const start = (input.page - 1) * input.pageSize
	const end = start + input.pageSize

	let query = supabase
		.schema("app")
		.from("interaction")
		.select()

	if (input.roleId) {
		query = query.eq("role_id", input.roleId)
	}
	if (input.personId) {
		query = query.eq("person_id", input.personId)
	}
	if (input.type) {
		query = query.eq("type", input.type)
	}

	const { data, error } = await query.range(start, end)

	if (error) return errFrom(`Error listing interactions: ${error.message}`)

	const hasNext = data.length > input.pageSize
	const interactions = data.slice(0, input.pageSize).map(unmarshalInteraction)

	return ok({ interactions, hasNext })
}
