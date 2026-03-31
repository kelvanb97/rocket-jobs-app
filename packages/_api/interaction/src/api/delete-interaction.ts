import { interaction } from "@rja-app/drizzle"
import { db } from "@rja-core/drizzle"
import { errFrom, ok, type TResult } from "@rja-core/result"
import { eq } from "drizzle-orm"

export function deleteInteraction(id: number): TResult<{ id: number }> {
	try {
		db().delete(interaction).where(eq(interaction.id, id)).run()
		return ok({ id })
	} catch (e) {
		return errFrom(
			`Error deleting interaction: ${e instanceof Error ? e.message : String(e)}`,
		)
	}
}
