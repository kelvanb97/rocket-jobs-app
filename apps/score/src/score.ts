import { listUnscoredRoles } from "@aja-api/role/api/list-unscored-roles"
import { scoreRoleById } from "@aja-api/score/api/score-role-by-id"

const RATE_LIMIT_MS = Number(process.env["SCORE_RATE_LIMIT_MS"] ?? "500")
const BATCH_SIZE = Number(process.env["SCORE_BATCH_SIZE"] ?? "5")

function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

type ScoreSummary = {
	scored: number
	errors: number
	total: number
}

export async function runScore(): Promise<ScoreSummary> {
	const result = await listUnscoredRoles()
	if (!result.ok) {
		throw new Error(result.error.message)
	}

	const roles = result.data
	console.log(
		`[score] Found ${roles.length} unscored roles (batch size: ${BATCH_SIZE})`,
	)

	if (roles.length === 0) {
		return { scored: 0, errors: 0, total: 0 }
	}

	let scored = 0
	let errors = 0

	for (let i = 0; i < roles.length; i += BATCH_SIZE) {
		const chunk = roles.slice(i, i + BATCH_SIZE)

		const results = await Promise.allSettled(
			chunk.map((role) =>
				scoreRoleById(role.id).then((r) => ({ role, r })),
			),
		)

		for (const settled of results) {
			if (settled.status === "rejected") {
				errors++
				console.warn(`[score] Unexpected error: ${settled.reason}`)
				continue
			}

			const { role, r: scoreResult } = settled.value
			if (scoreResult.ok) {
				scored++
				console.log(
					`[score] "${role.title}" → ${scoreResult.data.score}`,
				)
			} else {
				errors++
				console.warn(
					`[score] "${role.title}": ${scoreResult.error.message}`,
				)
			}
		}

		if (i + BATCH_SIZE < roles.length) {
			await delay(RATE_LIMIT_MS)
		}
	}

	return { scored, errors, total: roles.length }
}
