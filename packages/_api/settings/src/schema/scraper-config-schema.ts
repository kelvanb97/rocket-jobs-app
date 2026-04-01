import { z } from "zod"

export type { TScraperConfig, TNewScraperConfig } from "@rja-app/drizzle"

export const SOURCE_NAMES = [
	"remoteok",
	"weworkremotely",
	"himalayas",
	"jobicy",
	"google-jobs",
	"linkedin",
] as const
export type TSourceName = (typeof SOURCE_NAMES)[number]

export const upsertScraperConfigSchema = z.object({
	userProfileId: z.number(),
	relevantKeywords: z.array(z.string()),
	blockedKeywords: z.array(z.string()),
	blockedCompanies: z.array(z.string()),
	enabledSources: z.array(z.string()),
	googleTitles: z.array(z.string()),
	googleRemote: z.boolean(),
	googleFullTimeOnly: z.boolean(),
	googleFreshnessDays: z.number().int().min(1),
	googleMaxPages: z.number().int().min(1),
	linkedinUrls: z.array(z.string()),
	linkedinMaxPages: z.number().int().min(1),
	linkedinMaxPerPage: z.number().int().min(1),
})

export type TUpsertScraperConfig = z.infer<typeof upsertScraperConfigSchema>
