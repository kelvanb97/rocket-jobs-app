import type { Database } from "@aja-app/supabase"
import { errFrom, ok, type TResult } from "@aja-core/result"
import { supabaseAdminClient } from "@aja-core/supabase/admin"

export async function deleteInteraction(
	id: string,
): Promise<TResult<{ id: string }>> {
	const supabase = supabaseAdminClient<Database>()

	const { error } = await supabase
		.schema("app")
		.from("interaction")
		.delete()
		.eq("id", id)

	if (error) return errFrom(`Error deleting interaction: ${error.message}`)

	return ok({ id })
}
