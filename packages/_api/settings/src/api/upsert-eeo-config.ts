import { eeoConfig } from "@rja-app/drizzle"
import type { TEeoConfig } from "@rja-app/drizzle"
import { db } from "@rja-core/drizzle"
import { errFrom, ok, type TResult } from "@rja-core/result"
import type { TUpsertEeoConfig } from "#schema/eeo-config-schema"

export function upsertEeoConfig(input: TUpsertEeoConfig): TResult<TEeoConfig> {
	try {
		const result = db()
			.insert(eeoConfig)
			.values(input)
			.onConflictDoUpdate({
				target: eeoConfig.userProfileId,
				set: {
					gender: input.gender,
					ethnicity: input.ethnicity,
					veteranStatus: input.veteranStatus,
					disabilityStatus: input.disabilityStatus,
					workAuthorization: input.workAuthorization,
					requiresVisaSponsorship: input.requiresVisaSponsorship,
				},
			})
			.returning()
			.get()
		return ok(result)
	} catch (e) {
		return errFrom(
			`Error upserting EEO config: ${e instanceof Error ? e.message : String(e)}`,
		)
	}
}
