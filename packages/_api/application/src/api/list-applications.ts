import type { Database } from "@aja-app/supabase"
import { supabaseServerClient } from "@aja-core/supabase-next-auth/admin"
import { type TResult, errFrom, ok } from "@aja-core/result"
import type { TApplication, TListApplications } from "#schema/application-schema"
import { unmarshalApplication } from "#schema/application-marshallers"

export async function listApplications(
	input: TListApplications,
): Promise<TResult<{ applications: TApplication[]; hasNext: boolean }>> {
	const supabase = await supabaseServerClient<Database>()

	const start = (input.page - 1) * input.pageSize
	const end = start + input.pageSize

	let query = supabase
		.schema("app")
		.from("application")
		.select()

	if (input.roleId) {
		query = query.eq("role_id", input.roleId)
	}
	if (input.status) {
		query = query.eq("status", input.status)
	}

	const { data, error } = await query.range(start, end)

	if (error) return errFrom(`Error listing applications: ${error.message}`)

	const hasNext = data.length > input.pageSize
	const applications = data.slice(0, input.pageSize).map(unmarshalApplication)

	return ok({ applications, hasNext })
}
