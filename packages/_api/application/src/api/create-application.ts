import { application } from "@rja-app/drizzle"
import { db } from "@rja-core/drizzle"
import { errFrom, ok, type TResult } from "@rja-core/result"
import type {
	TApplication,
	TCreateApplication,
} from "#schema/application-schema"

export function createApplication(
	input: TCreateApplication,
): TResult<TApplication> {
	try {
		const row = db().insert(application).values(input).returning().get()
		return ok(row)
	} catch (e) {
		return errFrom(
			`Error creating application: ${e instanceof Error ? e.message : String(e)}`,
		)
	}
}
