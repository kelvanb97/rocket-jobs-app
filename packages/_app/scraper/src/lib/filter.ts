import { SCRAPER_CONFIG } from "@rja-config/user/scraper"
import type { ScrapedRole } from "#types"

const RELEVANT_TITLE_RE = new RegExp(
	SCRAPER_CONFIG.relevantKeywords.join("|"),
	"i",
)

const BLOCKED_TITLE_RE = new RegExp(
	SCRAPER_CONFIG.blockedKeywords
		.map((kw) => `\\b${kw.replace(/\s+/g, ".?")}\\b`)
		.join("|"),
	"i",
)

const BLOCKED_COMPANY_RE =
	SCRAPER_CONFIG.blockedCompanies.length > 0
		? new RegExp(
				SCRAPER_CONFIG.blockedCompanies
					.map((c) => `\\b${c.replace(/\s+/g, ".?")}\\b`)
					.join("|"),
				"i",
			)
		: null

export function filterRoles(roles: ScrapedRole[]): {
	filtered: ScrapedRole[]
	removedCount: number
} {
	const filtered = roles.filter(
		(r) =>
			RELEVANT_TITLE_RE.test(r.title) &&
			!BLOCKED_TITLE_RE.test(r.title) &&
			!(r.company && BLOCKED_COMPANY_RE?.test(r.company)),
	)
	return { filtered, removedCount: roles.length - filtered.length }
}
