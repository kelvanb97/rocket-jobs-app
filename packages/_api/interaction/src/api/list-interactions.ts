import { interaction } from "@rja-app/drizzle"
import { db } from "@rja-core/drizzle"
import { errFrom, ok, type TResult } from "@rja-core/result"
import type {
	TInteraction,
	TListInteractions,
} from "#schema/interaction-schema"
import { and, desc, eq } from "drizzle-orm"

export function listInteractions(
	input: TListInteractions,
): TResult<{ interactions: TInteraction[]; hasNext: boolean }> {
	try {
		const conditions = []

		if (input.roleId) {
			conditions.push(eq(interaction.roleId, input.roleId))
		}
		if (input.personId) {
			conditions.push(eq(interaction.personId, input.personId))
		}
		if (input.type) {
			conditions.push(eq(interaction.type, input.type))
		}

		const offset = (input.page - 1) * input.pageSize

		const rows = db()
			.select()
			.from(interaction)
			.where(conditions.length > 0 ? and(...conditions) : undefined)
			.orderBy(desc(interaction.createdAt), interaction.id)
			.limit(input.pageSize + 1)
			.offset(offset)
			.all()

		const hasNext = rows.length > input.pageSize
		const interactions = rows.slice(0, input.pageSize)

		return ok({ interactions, hasNext })
	} catch (e) {
		return errFrom(
			`Error listing interactions: ${e instanceof Error ? e.message : String(e)}`,
		)
	}
}
