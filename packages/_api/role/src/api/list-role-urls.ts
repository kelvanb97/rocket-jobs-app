import type { Database } from "@aja-app/supabase"
import { errFrom, ok, type TResult } from "@aja-core/result"
import { supabaseAdminClient } from "@aja-core/supabase/admin"

export async function listRoleUrls(urls: string[]): Promise<TResult<string[]>> {
	const supabase = supabaseAdminClient<Database>()

	const { data, error } = await supabase
		.schema("app")
		.from("role")
		.select("url")
		.in("url", urls)

	if (error) return errFrom(`Error listing role URLs: ${error.message}`)

	const existing = data
		.map((r) => r.url)
		.filter((url): url is string => url !== null)

	return ok(existing)
}
