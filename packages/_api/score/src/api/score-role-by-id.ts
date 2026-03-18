import { getCompany } from "@aja-api/company/api/get-company"
import { getRole } from "@aja-api/role/api/get-role"
import { errFrom, type TResult } from "@aja-core/result"
import type { TAnthropicModel } from "@aja-integrations/anthropic/client"
import { USER_PROFILE } from "#config/profile"
import { scoreRole } from "#lib/claude-client"
import { buildScoringPrompt } from "#prompt/scoring-prompt"
import type { TScore } from "#schema/score-schema"
import { upsertScore } from "./upsert-score.js"

const SCORER_MODEL = (process.env["SCORER_MODEL"] ??
	"claude-haiku-4-5-20251001") as TAnthropicModel

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

		const { system, user } = buildScoringPrompt(role, company, USER_PROFILE)
		const response = await scoreRole(SCORER_MODEL, system, user)

		return await upsertScore({
			roleId,
			score: Math.round(response.score),
			positive: response.positive,
			negative: response.negative,
		})
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err)
		return errFrom(`Failed to score role ${roleId}: ${message}`)
	}
}
