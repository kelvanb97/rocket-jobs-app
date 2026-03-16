import type { Database } from "@aja-app/supabase"
import { errFrom, ok, type TResult } from "@aja-core/result"
import { supabaseAdminClient } from "@aja-core/supabase/admin"
import { unmarshalInteraction } from "#schema/interaction-marshallers"
import type {
	TInteraction,
	TListInteractions,
} from "#schema/interaction-schema"

export async function listInteractions(
	input: TListInteractions,
): Promise<TResult<{ interactions: TInteraction[]; hasNext: boolean }>> {
	const supabase = supabaseAdminClient<Database>()

	const start = (input.page - 1) * input.pageSize
	const end = start + input.pageSize

	let query = supabase.schema("app").from("interaction").select()

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
