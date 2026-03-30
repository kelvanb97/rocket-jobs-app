import { application } from "@aja-app/drizzle"
import { db } from "@aja-core/drizzle"
import { errFrom, ok, type TResult } from "@aja-core/result"
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
