import { getCompany } from "@rja-api/company/api/get-company"
import { getRole } from "@rja-api/role/api/get-role"
import { errFrom, type TResult } from "@rja-core/result"
import type { TScore } from "#schema/score-schema"
import { scoreRoleData } from "./score-role-data"

export async function scoreRoleById(roleId: number): Promise<TResult<TScore>> {
	try {
		const roleResult = await getRole(roleId)
		if (!roleResult.ok) return errFrom(roleResult.error.message)

		const role = roleResult.data
		const companyResult = role.companyId ? getCompany(role.companyId) : null
		const company =
			companyResult && companyResult.ok ? companyResult.data : null

		return scoreRoleData(role, company)
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err)
		return errFrom(`Failed to score role ${roleId}: ${message}`)
	}
}
