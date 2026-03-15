import type { Database } from "@aja-app/supabase"
import { supabaseServerClient } from "@aja-core/supabase-next-auth/admin"
import { type TResult, errFrom, ok } from "@aja-core/result"
import type { TApplication, TUpdateApplication } from "#schema/application-schema"
import { unmarshalApplication } from "#schema/application-marshallers"

export async function updateApplication(
	input: TUpdateApplication,
): Promise<TResult<TApplication>> {
	const supabase = await supabaseServerClient<Database>()

	const updates: Record<string, unknown> = {}
	if (input.roleId !== undefined) updates.role_id = input.roleId
	if (input.status !== undefined) updates.status = input.status
	if (input.resumePath !== undefined) updates.resume_path = input.resumePath
	if (input.coverLetterPath !== undefined) updates.cover_letter_path = input.coverLetterPath
	if (input.submittedAt !== undefined) updates.submitted_at = input.submittedAt
	if (input.notes !== undefined) updates.notes = input.notes

	const { data, error } = await supabase
		.schema("app")
		.from("application")
		.update(updates)
		.eq("id", input.id)
		.select()
		.single()

	if (error) return errFrom(`Error updating application: ${error.message}`)

	return ok(unmarshalApplication(data))
}
