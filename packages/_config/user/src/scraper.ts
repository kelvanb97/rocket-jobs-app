export type TSourceName =
	| "remoteok"
	| "weworkremotely"
	| "himalayas"
	| "jobicy"
	| "google-jobs"

export type TScraperConfig = {
	relevantKeywords: string[]
	blockedKeywords: string[]
	enabledSources: TSourceName[]
}

export const GOOGLE_JOBS_SEARCH = {
	titles: [
		"senior software engineer",
		"senior frontend engineer",
		"senior full-stack engineer",
		"senior fullstack engineer",
		"senior react engineer",
		"senior typescript engineer",
		"senior next.js engineer",
		"senior web engineer",
	],
	remote: true,
	fullTimeOnly: true,
	freshnessdays: 3,
	maxPagesPerQuery: 5,
} as const

export const SCRAPER_CONFIG: TScraperConfig = {
	relevantKeywords: [
		"engineer",
		"developer",
		"software",
		"frontend",
		"fullstack",
		"full-stack",
		"react",
		"typescript",
		"node",
	],
	blockedKeywords: [
		"sales",
		"manager",
		"director",
		"vp",
		"vice president",
		"principal",
		"staff",
	],
	enabledSources: [
		// "remoteok",
		// "weworkremotely",
		// "himalayas",
		// "jobicy",
		"google-jobs",
	],
}
