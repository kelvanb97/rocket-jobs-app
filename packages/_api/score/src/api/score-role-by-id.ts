import { getCompany } from "@aja-api/company/api/get-company"
import { getRole } from "@aja-api/role/api/get-role"
import { errFrom, type TResult } from "@aja-core/result"
import type { TScore } from "#schema/score-schema"
import { scoreRoleData } from "./score-role-data.js"

export async function scoreRoleById(roleId: string): Promise<TResult<TScore>> {
	try {
		const roleResult = await getRole(roleId)
		if (!roleResult.ok) return errFrom(roleResult.error.message)

		const role = roleResult.data
		const company = role.companyId
			? await getCompany(role.companyId).then((r) =>
					r.ok ? r.data : null,
				)
			: null

		return scoreRoleData(role, company)
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err)
		return errFrom(`Failed to score role ${roleId}: ${message}`)
	}
}
