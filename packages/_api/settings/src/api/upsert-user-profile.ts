import { userProfile } from "@rja-app/drizzle"
import type { TUserProfile } from "@rja-app/drizzle"
import { db } from "@rja-core/drizzle"
import { errFrom, ok, type TResult } from "@rja-core/result"
import type { TUpsertUserProfile } from "#schema/user-profile-schema"
import { eq } from "drizzle-orm"

export function upsertUserProfile(
	input: TUpsertUserProfile,
): TResult<TUserProfile> {
	try {
		if (input.id) {
			const result = db()
				.update(userProfile)
				.set(input)
				.where(eq(userProfile.id, input.id))
				.returning()
				.get()
			if (!result) return errFrom("User profile not found")
			return ok(result)
		}

		const result = db().insert(userProfile).values(input).returning().get()
		return ok(result)
	} catch (e) {
		return errFrom(
			`Error upserting user profile: ${e instanceof Error ? e.message : String(e)}`,
		)
	}
}
