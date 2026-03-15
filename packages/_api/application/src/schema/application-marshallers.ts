import type { TApplication, TMarshalledApplication } from "./application-schema"

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

export function marshalApplication(
	a: Omit<TApplication, "id" | "createdAt" | "updatedAt">,
): Omit<TMarshalledApplication, "id" | "created_at" | "updated_at"> {
	return {
		role_id: a.roleId,
		status: a.status,
		resume_path: a.resumePath,
		cover_letter_path: a.coverLetterPath,
		submitted_at: a.submittedAt,
		notes: a.notes,
	}
}
