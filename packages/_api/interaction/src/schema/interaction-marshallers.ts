import type { TInteraction, TMarshalledInteraction } from "./interaction-schema"

export function unmarshalInteraction(m: TMarshalledInteraction): TInteraction {
	return {
		id: m.id,
		roleId: m.role_id,
		personId: m.person_id,
		type: m.type,
		notes: m.notes,
		createdAt: m.created_at,
		updatedAt: m.updated_at,
	}
}

export function marshalInteraction(
	i: Omit<TInteraction, "id" | "createdAt" | "updatedAt">,
): Omit<TMarshalledInteraction, "id" | "created_at" | "updated_at"> {
	return {
		role_id: i.roleId,
		person_id: i.personId,
		type: i.type,
		notes: i.notes,
	}
}
