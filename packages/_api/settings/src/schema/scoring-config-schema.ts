import { z } from "zod"

export type { TScoringConfig, TNewScoringConfig } from "@rja-app/drizzle"

export const SCORING_WEIGHT_VALUES = ["high", "medium", "low"] as const
export type TScoringWeight = (typeof SCORING_WEIGHT_VALUES)[number]

export const upsertScoringConfigSchema = z.object({
	userProfileId: z.number(),
	titleAndSeniority: z.enum(SCORING_WEIGHT_VALUES),
	skills: z.enum(SCORING_WEIGHT_VALUES),
	salary: z.enum(SCORING_WEIGHT_VALUES),
	location: z.enum(SCORING_WEIGHT_VALUES),
	industry: z.enum(SCORING_WEIGHT_VALUES),
})

export type TUpsertScoringConfig = z.infer<typeof upsertScoringConfigSchema>
