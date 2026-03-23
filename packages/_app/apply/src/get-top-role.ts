import { getCompany } from "@aja-api/company/api/get-company"
import { getTopUnappliedRole } from "@aja-api/role/api/get-top-unapplied-role"
import { ok, type TResult } from "@aja-core/result"
import type { TTopRoleResult } from "./types"

export async function getTopRole(): Promise<TResult<TTopRoleResult | null>> {
	const result = await getTopUnappliedRole()
	if (!result.ok) return result

	const roleWithScore = result.data
	if (!roleWithScore) return ok(null)

	let companyName = "Unknown Company"
	if (roleWithScore.companyId) {
		const c = await getCompany(roleWithScore.companyId)
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
