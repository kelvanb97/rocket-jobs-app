import { getCompany } from "@rja-api/company/api/get-company"
import { getTopUnappliedRole } from "@rja-api/role/api/get-top-unapplied-role"
import { ok, type TResult } from "@rja-core/result"
import type { TTopRoleResult } from "./types"

export function getTopRole(): TResult<TTopRoleResult | null> {
	const result = getTopUnappliedRole()
	if (!result.ok) return result

	const roleWithScore = result.data
	if (!roleWithScore) return ok(null)

	let companyName = "Unknown Company"
	if (roleWithScore.companyId) {
		const c = getCompany(roleWithScore.companyId)
		if (c.ok && c.data) companyName = c.data.name
	}

	return ok({
		id: roleWithScore.id,
		title: roleWithScore.title,
		companyId: roleWithScore.companyId,
		companyName,
		score: roleWithScore.score,
		url: roleWithScore.url,
		description: roleWithScore.description?.slice(0, 500) ?? null,
		location: roleWithScore.location,
		locationType: roleWithScore.locationType,
		salaryMin: roleWithScore.salaryMin,
		salaryMax: roleWithScore.salaryMax,
	})
}
