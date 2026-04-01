import { education, userProfile, workExperience } from "@rja-app/drizzle"
import { db } from "@rja-core/drizzle"
import { errFrom, ok, type TResult } from "@rja-core/result"
import type { TUserProfileFull } from "#schema/user-profile-schema"
import { asc, eq } from "drizzle-orm"

export function getUserProfile(): TResult<TUserProfileFull> {
	try {
		const profile = db().select().from(userProfile).limit(1).get()
		if (!profile) return errFrom("User profile not configured")

		const experiences = db()
			.select()
			.from(workExperience)
			.where(eq(workExperience.userProfileId, profile.id))
			.orderBy(asc(workExperience.sortOrder))
			.all()

		const educations = db()
			.select()
			.from(education)
			.where(eq(education.userProfileId, profile.id))
			.orderBy(asc(education.sortOrder))
			.all()

		return ok({
			...profile,
			workExperience: experiences,
			education: educations,
		})
	} catch (e) {
		return errFrom(
			`Error fetching user profile: ${e instanceof Error ? e.message : String(e)}`,
		)
	}
}
