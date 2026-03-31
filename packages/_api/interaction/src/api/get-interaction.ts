import { interaction } from "@rja-app/drizzle"
import { db } from "@rja-core/drizzle"
import { errFrom, ok, type TResult } from "@rja-core/result"
import type { TInteraction } from "#schema/interaction-schema"
import { eq } from "drizzle-orm"

export function getInteraction(id: number): TResult<TInteraction> {
	try {
		const row = db()
			.select()
			.from(interaction)
			.where(eq(interaction.id, id))
			.get()
		if (!row) return errFrom(`Interaction not found: ${id}`)
		return ok(row)
	} catch (e) {
		return errFrom(
			`Error fetching interaction: ${e instanceof Error ? e.message : String(e)}`,
		)
	}
}
