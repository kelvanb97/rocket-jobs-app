"use server"

import { getCompany } from "@aja-api/company/api/get-company"
import { listRoles } from "@aja-api/role/api/list-roles"
import { listRolesSchema } from "@aja-api/role/schema/role-schema"
import { listScoresByRoles } from "@aja-api/score/api/list-scores-by-roles"
import type { TScore } from "@aja-api/score/schema/score-schema"
import { actionClient, SafeForClientError } from "@aja-core/next-safe-action"

export const listRolesWithCompaniesAction = actionClient
	.inputSchema(listRolesSchema)
	.action(async ({ parsedInput }) => {
		const result = await listRoles(parsedInput)
		if (!result.ok) {
			throw new SafeForClientError(result.error.message)
		}

		const roleIds = result.data.roles.map((r) => r.id)

		const companyIds = [
			...new Set(
				result.data.roles
					.map((r) => r.companyId)
					.filter((id): id is string => id !== null),
			),
		]

		const [companyResults, scoresResult] = await Promise.all([
			Promise.all(companyIds.map((id) => getCompany(id))),
			listScoresByRoles(roleIds),
		])

		const companies = companyResults.filter((r) => r.ok).map((r) => r.data)

		const scores: TScore[] = scoresResult.ok ? scoresResult.data : []

		return {
			roles: result.data.roles,
			companies,
			scores,
			hasNext: result.data.hasNext,
		}
	})
