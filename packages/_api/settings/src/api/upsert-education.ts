import { education } from "@rja-app/drizzle"
import type { TEducation } from "@rja-app/drizzle"
import { db } from "@rja-core/drizzle"
import { errFrom, ok, type TResult } from "@rja-core/result"
import type { TUpsertEducation } from "#schema/user-profile-schema"
import { eq } from "drizzle-orm"

export function upsertEducation(input: TUpsertEducation): TResult<TEducation> {
	try {
		if (input.id) {
			const result = db()
				.update(education)
				.set(input)
				.where(eq(education.id, input.id))
				.returning()
				.get()
			if (!result) return errFrom("Education not found")
			return ok(result)
		}

		const result = db().insert(education).values(input).returning().get()
		return ok(result)
	} catch (e) {
		return errFrom(
			`Error upserting education: ${e instanceof Error ? e.message : String(e)}`,
		)
	}
}
