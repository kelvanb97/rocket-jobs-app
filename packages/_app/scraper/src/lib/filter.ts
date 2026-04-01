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
	const RELEVANT_TITLE_RE = new RegExp(config.relevantKeywords.join("|"), "i")

	const BLOCKED_TITLE_RE = new RegExp(
		config.blockedKeywords
			.map((kw) => `\\b${kw.replace(/\s+/g, ".?")}\\b`)
			.join("|"),
		"i",
	)

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
			RELEVANT_TITLE_RE.test(r.title) &&
			!BLOCKED_TITLE_RE.test(r.title) &&
			!(r.company && BLOCKED_COMPANY_RE?.test(r.company)),
	)
	return { filtered, removedCount: roles.length - filtered.length }
}
