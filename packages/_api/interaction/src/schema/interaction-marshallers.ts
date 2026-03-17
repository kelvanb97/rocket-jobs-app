import type { Database } from "@aja-app/supabase"
import type {
	TCreateInteraction,
	TInteraction,
	TMarshalledInteraction,
	TUpdateInteraction,
} from "./interaction-schema"

type InteractionInsert = Database["app"]["Tables"]["interaction"]["Insert"]
type InteractionUpdate = Database["app"]["Tables"]["interaction"]["Update"]

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

export function marshalCreateInteraction(
	input: TCreateInteraction,
): InteractionInsert {
	return {
		role_id: input.roleId ?? null,
		person_id: input.personId ?? null,
		type: input.type,
		notes: input.notes ?? null,
	}
}

export function marshalUpdateInteraction(
	input: TUpdateInteraction,
): InteractionUpdate {
	const updates: InteractionUpdate = {}
	if (input.roleId !== undefined) updates.role_id = input.roleId
	if (input.personId !== undefined) updates.person_id = input.personId
	if (input.type !== undefined) updates.type = input.type
	if (input.notes !== undefined) updates.notes = input.notes
	return updates
}
