import type { Database } from "@aja-app/supabase"
import type {
	TCreateRole,
	TMarshalledRole,
	TRole,
	TUpdateRole,
} from "./role-schema"
import {
	locationTypeSchema,
	roleSourceSchema,
	roleStatusSchema,
} from "./role-schema"

type RoleInsert = Database["app"]["Tables"]["role"]["Insert"]
type RoleUpdate = Database["app"]["Tables"]["role"]["Update"]

export function unmarshalRole(m: TMarshalledRole): TRole {
	return {
		id: m.id,
		companyId: m.company_id,
		title: m.title,
		url: m.url,
		description: m.description,
		source: m.source ? roleSourceSchema.parse(m.source) : null,
		locationType: m.location_type
			? locationTypeSchema.parse(m.location_type)
			: null,
		location: m.location,
		salaryMin: m.salary_min,
		salaryMax: m.salary_max,
		status: roleStatusSchema.parse(m.status),
		postedAt: m.posted_at,
		notes: m.notes,
		createdAt: m.created_at,
		updatedAt: m.updated_at,
	}
}

export function marshalCreateRole(input: TCreateRole): RoleInsert {
	return {
		company_id: input.companyId ?? null,
		title: input.title,
		url: input.url ?? null,
		description: input.description ?? null,
		source: input.source ?? null,
		location_type: input.locationType ?? null,
		location: input.location ?? null,
		salary_min: input.salaryMin ?? null,
		salary_max: input.salaryMax ?? null,
		status: input.status ?? "pending",
		posted_at: input.postedAt ?? null,
		notes: input.notes ?? null,
	}
}

export function marshalUpdateRole(input: TUpdateRole): RoleUpdate {
	const updates: RoleUpdate = {}
	if (input.companyId !== undefined) updates.company_id = input.companyId
	if (input.title !== undefined) updates.title = input.title
	if (input.url !== undefined) updates.url = input.url
	if (input.description !== undefined) updates.description = input.description
	if (input.source !== undefined) updates.source = input.source
	if (input.locationType !== undefined)
		updates.location_type = input.locationType
	if (input.location !== undefined) updates.location = input.location
	if (input.salaryMin !== undefined) updates.salary_min = input.salaryMin
	if (input.salaryMax !== undefined) updates.salary_max = input.salaryMax
	if (input.status !== undefined) updates.status = input.status
	if (input.postedAt !== undefined) updates.posted_at = input.postedAt
	if (input.notes !== undefined) updates.notes = input.notes
	return updates
}
