import type { Database } from "@aja-app/supabase"
import { supabaseServerClient } from "@aja-core/supabase-next-auth/admin"
import { type TResult, errFrom, ok } from "@aja-core/result"

export async function deleteApplication(
	id: string,
): Promise<TResult<{ id: string }>> {
	const supabase = await supabaseServerClient<Database>()

	const { error } = await supabase
		.schema("app")
		.from("application")
		.delete()
		.eq("id", id)

	if (error) return errFrom(`Error deleting application: ${error.message}`)

	return ok({ id })
}
