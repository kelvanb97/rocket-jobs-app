import type { Database } from "@aja-app/supabase"
import { supabaseServerClient } from "@aja-core/supabase-next-auth/admin"
import { type TResult, errFrom, ok } from "@aja-core/result"

export async function deleteInteraction(
	id: string,
): Promise<TResult<{ id: string }>> {
	const supabase = await supabaseServerClient<Database>()

	const { error } = await supabase
		.schema("app")
		.from("interaction")
		.delete()
		.eq("id", id)

	if (error) return errFrom(`Error deleting interaction: ${error.message}`)

	return ok({ id })
}
