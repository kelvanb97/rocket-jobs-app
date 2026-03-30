import { application } from "@aja-app/drizzle"
import { db } from "@aja-core/drizzle"
import { errFrom, ok, type TResult } from "@aja-core/result"
import type {
	TApplication,
	TUpdateApplication,
} from "#schema/application-schema"
import { eq } from "drizzle-orm"

export function updateApplication(
	input: TUpdateApplication,
): TResult<TApplication> {
	try {
		const row = db()
			.update(application)
			.set(input)
			.where(eq(application.id, input.id))
			.returning()
			.get()
		if (!row) return errFrom(`Application not found: ${input.id}`)
		return ok(row)
	} catch (e) {
		return errFrom(
			`Error updating application: ${e instanceof Error ? e.message : String(e)}`,
		)
	}
}
