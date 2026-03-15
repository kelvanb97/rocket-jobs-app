import type { Database } from "@aja-app/supabase"
import { errFrom, ok, type TResult } from "@aja-core/result"
import { supabaseAdminClient } from "@aja-core/supabase-next-auth/admin"

export async function deleteRole(id: string): Promise<TResult<{ id: string }>> {
	const supabase = supabaseAdminClient<Database>()

	const { error } = await supabase
		.schema("app")
		.from("role")
		.delete()
		.eq("id", id)

	if (error) return errFrom(`Error deleting role: ${error.message}`)

	return ok({ id })
}
