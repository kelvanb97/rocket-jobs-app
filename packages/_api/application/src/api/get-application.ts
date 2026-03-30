import { application } from "@aja-app/drizzle"
import { db } from "@aja-core/drizzle"
import { errFrom, ok, type TResult } from "@aja-core/result"
import type { TApplication } from "#schema/application-schema"
import { eq } from "drizzle-orm"

export function getApplication(id: number): TResult<TApplication> {
	try {
		const row = db()
			.select()
			.from(application)
			.where(eq(application.id, id))
			.get()
		if (!row) return errFrom(`Application not found: ${id}`)
		return ok(row)
	} catch (e) {
		return errFrom(
			`Error fetching application: ${e instanceof Error ? e.message : String(e)}`,
		)
	}
}
