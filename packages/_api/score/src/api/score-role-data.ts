import type { TCompany } from "@rja-api/company/schema/company-schema"
import type { TRole } from "@rja-api/role/schema/role-schema"
import { USER_PROFILE } from "@rja-config/user/experience"
import { SCORING_WEIGHTS } from "@rja-config/user/scoring"
import { errFrom, type TResult } from "@rja-core/result"
import type { TAnthropicModel } from "@rja-integrations/anthropic/client"
import { scoreRole } from "#lib/claude-client"
import { buildScoringPrompt } from "#prompt/scoring-prompt"
import type { TScore } from "#schema/score-schema"
import { upsertScore } from "./upsert-score"

const SCORER_MODEL = (process.env["SCORE_MODEL"] ??
	"claude-haiku-4-5-20251001") as TAnthropicModel

export async function scoreRoleData(
	role: TRole,
	company: TCompany | null,
	options?: { model?: TAnthropicModel },
): Promise<TResult<TScore>> {
	try {
		const model = options?.model ?? SCORER_MODEL
		const { system, user } = buildScoringPrompt(
			role,
			company,
			USER_PROFILE,
			SCORING_WEIGHTS,
		)
		const response = await scoreRole(model, system, user)
		return upsertScore({
			roleId: role.id,
			score: Math.round(response.score),
			positive: response.positive,
			negative: response.negative,
		})
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err)
		return errFrom(`Failed to score role ${role.id}: ${message}`)
	}
}
