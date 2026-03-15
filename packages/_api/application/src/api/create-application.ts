import type { Database } from "@aja-app/supabase"
import { errFrom, ok, type TResult } from "@aja-core/result"
import { supabaseAdminClient } from "@aja-core/supabase-next-auth/admin"
import { unmarshalApplication } from "#schema/application-marshallers"
import type {
	TApplication,
	TCreateApplication,
} from "#schema/application-schema"

export async function createApplication(
	input: TCreateApplication,
): Promise<TResult<TApplication>> {
	const supabase = supabaseAdminClient<Database>()

	const { data, error } = await supabase
		.schema("app")
		.from("application")
		.insert({
			role_id: input.roleId ?? null,
			status: input.status,
			resume_path: input.resumePath ?? null,
			cover_letter_path: input.coverLetterPath ?? null,
			submitted_at: input.submittedAt ?? null,
			notes: input.notes ?? null,
		})
		.select()
		.single()

	if (error) return errFrom(`Error creating application: ${error.message}`)

	return ok(unmarshalApplication(data))
}
