export type TSourceName =
	| "remoteok"
	| "weworkremotely"
	| "himalayas"
	| "jobicy"
	| "google-jobs"
	| "linkedin"

export type TScraperConfig = {
	relevantKeywords: string[]
	blockedKeywords: string[]
	enabledSources: TSourceName[]
}

export const GOOGLE_JOBS_SEARCH = {
	titles: [
		"software engineer",
		"frontend engineer",
		"full-stack engineer",
		"fullstack engineer",
		"react engineer",
		"typescript engineer",
		"next.js engineer",
		"web engineer",
		"product engineer",
		"design engineer",
		"senior software engineer",
		"senior frontend engineer",
		"senior full-stack engineer",
		"senior fullstack engineer",
		"senior react engineer",
		"senior typescript engineer",
		"senior next.js engineer",
		"senior web engineer",
		"senior product engineer",
		"senior design engineer",
	],
	remote: true,
	fullTimeOnly: true,
	freshnessdays: 3,
	maxPagesPerQuery: 5,
} as const

export const LINKEDIN_SEARCH = {
	urls: [
		"https://www.linkedin.com/jobs/search/?f_E=4&f_JT=F&f_SB2=7&f_TPR=r86400&f_WT=&keywords=software%20engineer&origin=JOB_SEARCH_PAGE_JOB_FILTER&refresh=true&sortBy=R",
		"https://www.linkedin.com/jobs/search/?f_E=4&f_WT=2&keywords=software%20engineer&origin=JOB_SEARCH_PAGE_JOB_FILTER&refresh=true",
		"https://www.linkedin.com/jobs/search/?f_E=4&f_WT=2&keywords=frontend%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true",
		"https://www.linkedin.com/jobs/search/?f_E=4&f_WT=2&keywords=full%20stack%20engineer&origin=JOB_SEARCH_PAGE_OTHER_ENTRY&refresh=true&spellCorrectionEnabled=false",
		"https://www.linkedin.com/jobs/search/?f_E=4&f_WT=2&keywords=react%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true",
		"https://www.linkedin.com/jobs/search/?f_E=4&f_WT=2&keywords=typescript&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true",
		"https://www.linkedin.com/jobs/search/?f_E=4&f_WT=2&keywords=next.js&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true",
		"https://www.linkedin.com/jobs/search/?f_E=4&f_WT=2&keywords=product%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true",
		"https://www.linkedin.com/jobs/search/?f_E=4&f_WT=2&keywords=design%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true",
	],
	maxPages: 5,
	maxPerPage: 25,
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
		"linkedin",
	],
}
