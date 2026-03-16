import type {
	TRole,
	TMarshalledRole,
	TRoleSource,
	TRoleStatus,
	TLocationType,
} from "./role-schema"

export function unmarshalRole(m: TMarshalledRole): TRole {
	return {
		id: m.id,
		companyId: m.company_id,
		title: m.title,
		url: m.url,
		description: m.description,
		source: m.source as TRoleSource | null,
		locationType: m.location_type as TLocationType | null,
		location: m.location,
		salaryMin: m.salary_min,
		salaryMax: m.salary_max,
		status: m.status as TRoleStatus,
		postedAt: m.posted_at,
		notes: m.notes,
		createdAt: m.created_at,
		updatedAt: m.updated_at,
	}
}

export function marshalRole(
	r: Omit<TRole, "id" | "createdAt" | "updatedAt">,
): Omit<TMarshalledRole, "id" | "created_at" | "updated_at"> {
	return {
		company_id: r.companyId,
		title: r.title,
		url: r.url,
		description: r.description,
		source: r.source,
		location_type: r.locationType,
		location: r.location,
		salary_min: r.salaryMin,
		salary_max: r.salaryMax,
		status: r.status,
		posted_at: r.postedAt,
		notes: r.notes,
	}
}
