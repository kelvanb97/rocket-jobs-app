import { z } from "zod"

export type { TEeoConfig, TNewEeoConfig } from "@rja-app/drizzle"

export const upsertEeoConfigSchema = z.object({
	userProfileId: z.number(),
	gender: z.string().nullable(),
	ethnicity: z.string().nullable(),
	veteranStatus: z.string().nullable(),
	disabilityStatus: z.string().nullable(),
	workAuthorization: z.string().nullable(),
	requiresVisaSponsorship: z.boolean(),
})

export type TUpsertEeoConfig = z.infer<typeof upsertEeoConfigSchema>
