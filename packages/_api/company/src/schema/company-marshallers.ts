import type { TCompany, TMarshalledCompany } from "./company-schema"

export function unmarshalCompany(m: TMarshalledCompany): TCompany {
	return {
		id: m.id,
		name: m.name,
		website: m.website,
		linkedinUrl: m.linkedin_url,
		size: m.size,
		stage: m.stage,
		industry: m.industry,
		notes: m.notes,
		createdAt: m.created_at,
		updatedAt: m.updated_at,
	}
}

export function marshalCompany(
	c: Omit<TCompany, "id" | "createdAt" | "updatedAt">,
): Omit<TMarshalledCompany, "id" | "created_at" | "updated_at"> {
	return {
		name: c.name,
		website: c.website,
		linkedin_url: c.linkedinUrl,
		size: c.size,
		stage: c.stage,
		industry: c.industry,
		notes: c.notes,
	}
}
