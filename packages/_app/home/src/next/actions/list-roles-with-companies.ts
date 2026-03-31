"use server"

import { getCompany } from "@rja-api/company/api/get-company"
import { listRoles } from "@rja-api/role/api/list-roles"
import { listRolesSchema } from "@rja-api/role/schema/role-schema"
import { listScoresByRoles } from "@rja-api/score/api/list-scores-by-roles"
import type { TScore } from "@rja-api/score/schema/score-schema"
import { actionClient, SafeForClientError } from "@rja-core/next-safe-action"

export const listRolesWithCompaniesAction = actionClient
	.inputSchema(listRolesSchema)
	.action(async ({ parsedInput }) => {
		const result = listRoles(parsedInput)
		if (!result.ok) {
			throw new SafeForClientError(result.error.message)
		}

		const roleIds = result.data.roles.map((r) => r.id)

		const companyIds = [
			...new Set(
				result.data.roles
					.map((r) => r.companyId)
					.filter((id): id is number => id !== null),
			),
		]

		const companyResults = companyIds.map((id) => getCompany(id))
		const scoresResult = listScoresByRoles(roleIds)

		const companies = companyResults.filter((r) => r.ok).map((r) => r.data)

		const scores: TScore[] = scoresResult.ok ? scoresResult.data : []

		return {
			roles: result.data.roles,
			companies,
			scores,
			hasNext: result.data.hasNext,
		}
	})
