import type { Database } from "@aja-app/supabase"
import { errFrom, ok, type TResult } from "@aja-core/result"
import { supabaseAdminClient } from "@aja-core/supabase/admin"
import { unmarshalApplication } from "#schema/application-marshallers"
import type {
	TApplication,
	TListApplications,
} from "#schema/application-schema"

export async function listApplications(
	input: TListApplications,
): Promise<TResult<{ applications: TApplication[]; hasNext: boolean }>> {
	const supabase = supabaseAdminClient<Database>()

	const start = (input.page - 1) * input.pageSize
	const end = start + input.pageSize

	let query = supabase.schema("app").from("application").select()

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
