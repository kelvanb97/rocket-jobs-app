import { formDefaults } from "@rja-app/drizzle"
import type { TFormDefaults } from "@rja-app/drizzle"
import { db } from "@rja-core/drizzle"
import { errFrom, ok, type TResult } from "@rja-core/result"
import type { TUpsertFormDefaults } from "#schema/form-defaults-schema"

export function upsertFormDefaults(
	input: TUpsertFormDefaults,
): TResult<TFormDefaults> {
	try {
		const result = db()
			.insert(formDefaults)
			.values(input)
			.onConflictDoUpdate({
				target: formDefaults.userProfileId,
				set: {
					howDidYouHear: input.howDidYouHear,
					referredByEmployee: input.referredByEmployee,
					nonCompeteAgreement: input.nonCompeteAgreement,
					previouslyEmployed: input.previouslyEmployed,
					professionalReferences: input.professionalReferences,
					employmentType: input.employmentType,
				},
			})
			.returning()
			.get()
		return ok(result)
	} catch (e) {
		return errFrom(
			`Error upserting form defaults: ${e instanceof Error ? e.message : String(e)}`,
		)
	}
}
