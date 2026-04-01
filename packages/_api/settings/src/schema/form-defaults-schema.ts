import { z } from "zod"

export type { TFormDefaults, TNewFormDefaults } from "@rja-app/drizzle"

export const upsertFormDefaultsSchema = z.object({
	userProfileId: z.number(),
	howDidYouHear: z.string(),
	referredByEmployee: z.string(),
	nonCompeteAgreement: z.string(),
	previouslyEmployed: z.string(),
	professionalReferences: z.string(),
	employmentType: z.string(),
})

export type TUpsertFormDefaults = z.infer<typeof upsertFormDefaultsSchema>
