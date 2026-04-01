import { workExperience } from "@rja-app/drizzle"
import type { TWorkExperience } from "@rja-app/drizzle"
import { db } from "@rja-core/drizzle"
import { errFrom, ok, type TResult } from "@rja-core/result"
import type { TUpsertWorkExperience } from "#schema/user-profile-schema"
import { eq } from "drizzle-orm"

export function upsertWorkExperience(
	input: TUpsertWorkExperience,
): TResult<TWorkExperience> {
	try {
		if (input.id) {
			const result = db()
				.update(workExperience)
				.set(input)
				.where(eq(workExperience.id, input.id))
				.returning()
				.get()
			if (!result) return errFrom("Work experience not found")
			return ok(result)
		}

		const result = db()
			.insert(workExperience)
			.values(input)
			.returning()
			.get()
		return ok(result)
	} catch (e) {
		return errFrom(
			`Error upserting work experience: ${e instanceof Error ? e.message : String(e)}`,
		)
	}
}
