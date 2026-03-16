import type { Database } from "@aja-app/supabase"
import { errFrom, ok, type TResult } from "@aja-core/result"
import { supabaseAdminClient } from "@aja-core/supabase/admin"

export async function deletePerson(
	id: string,
): Promise<TResult<{ id: string }>> {
	const supabase = supabaseAdminClient<Database>()

	const { error } = await supabase
		.schema("app")
		.from("person")
		.delete()
		.eq("id", id)

	if (error) return errFrom(`Error deleting person: ${error.message}`)

	return ok({ id })
}
