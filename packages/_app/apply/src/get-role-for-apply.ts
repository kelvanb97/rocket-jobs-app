import { getCompany } from "@rja-api/company/api/get-company"
import { getRole } from "@rja-api/role/api/get-role"
import { getScoreByRole } from "@rja-api/score/api/get-score-by-role"
import { ok, type TResult } from "@rja-core/result"
import type { TTopRoleResult } from "./types"

export function getRoleForApply(
	roleId: number,
): TResult<TTopRoleResult | null> {
	const roleResult = getRole(roleId)
	if (!roleResult.ok) return ok(null)
	const role = roleResult.data

	const scoreResult = getScoreByRole(roleId)
	if (!scoreResult.ok) return scoreResult
	const scoreValue = scoreResult.data?.score ?? 0

	let companyName = "Unknown Company"
	if (role.companyId) {
		const c = getCompany(role.companyId)
		if (c.ok && c.data) companyName = c.data.name
	}

	return ok({
		id: role.id,
		title: role.title,
		companyId: role.companyId,
		companyName,
		score: scoreValue,
		url: role.url,
		description: role.description?.slice(0, 500) ?? null,
		location: role.location,
		locationType: role.locationType,
		salaryMin: role.salaryMin,
		salaryMax: role.salaryMax,
	})
}
