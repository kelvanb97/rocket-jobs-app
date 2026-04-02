import type { ScrapedRole } from "#types"

type TFilterConfig = {
	relevantKeywords: string[]
	blockedKeywords: string[]
	blockedCompanies: string[]
}

export function filterRoles(
	roles: ScrapedRole[],
	config: TFilterConfig,
): {
	filtered: ScrapedRole[]
	removedCount: number
} {
	const RELEVANT_TITLE_RE =
		config.relevantKeywords.length > 0
			? new RegExp(config.relevantKeywords.join("|"), "i")
			: null

	const BLOCKED_TITLE_RE =
		config.blockedKeywords.length > 0
			? new RegExp(
					config.blockedKeywords
						.map((kw) => `\\b${kw.replace(/\s+/g, ".?")}\\b`)
						.join("|"),
					"i",
				)
			: null

	const BLOCKED_COMPANY_RE =
		config.blockedCompanies.length > 0
			? new RegExp(
					config.blockedCompanies
						.map((c) => `\\b${c.replace(/\s+/g, ".?")}\\b`)
						.join("|"),
					"i",
				)
			: null

	const filtered = roles.filter(
		(r) =>
			(!RELEVANT_TITLE_RE || RELEVANT_TITLE_RE.test(r.title)) &&
			(!BLOCKED_TITLE_RE || !BLOCKED_TITLE_RE.test(r.title)) &&
			!(r.company && BLOCKED_COMPANY_RE?.test(r.company)),
	)
	return { filtered, removedCount: roles.length - filtered.length }
}
