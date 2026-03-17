import type { Database } from "@aja-app/supabase"
import type {
	TApplication,
	TCreateApplication,
	TMarshalledApplication,
	TUpdateApplication,
} from "./application-schema"

type ApplicationInsert = Database["app"]["Tables"]["application"]["Insert"]
type ApplicationUpdate = Database["app"]["Tables"]["application"]["Update"]

export function unmarshalApplication(m: TMarshalledApplication): TApplication {
	return {
		id: m.id,
		roleId: m.role_id,
		status: m.status,
		resumePath: m.resume_path,
		coverLetterPath: m.cover_letter_path,
		submittedAt: m.submitted_at,
		notes: m.notes,
		createdAt: m.created_at,
		updatedAt: m.updated_at,
	}
}

export function marshalCreateApplication(
	input: TCreateApplication,
): ApplicationInsert {
	return {
		role_id: input.roleId ?? null,
		status: input.status ?? "draft",
		resume_path: input.resumePath ?? null,
		cover_letter_path: input.coverLetterPath ?? null,
		submitted_at: input.submittedAt ?? null,
		notes: input.notes ?? null,
	}
}

export function marshalUpdateApplication(
	input: TUpdateApplication,
): ApplicationUpdate {
	const updates: ApplicationUpdate = {}
	if (input.roleId !== undefined) updates.role_id = input.roleId
	if (input.status !== undefined) updates.status = input.status
	if (input.resumePath !== undefined) updates.resume_path = input.resumePath
	if (input.coverLetterPath !== undefined)
		updates.cover_letter_path = input.coverLetterPath
	if (input.submittedAt !== undefined)
		updates.submitted_at = input.submittedAt
	if (input.notes !== undefined) updates.notes = input.notes
	return updates
}
