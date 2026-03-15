import type { Database } from "@aja-app/supabase"
import { supabaseServerClient } from "@aja-core/supabase-next-auth/admin"
import { type TResult, errFrom, ok } from "@aja-core/result"
import type { TApplication, TCreateApplication } from "#schema/application-schema"
import { unmarshalApplication } from "#schema/application-marshallers"

export async function createApplication(
	input: TCreateApplication,
): Promise<TResult<TApplication>> {
	const supabase = await supabaseServerClient<Database>()

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
