import { listUnscoredRoles } from "@aja-api/role/api/list-unscored-roles"
import { scoreRoleById } from "@aja-api/score/api/score-role-by-id"
import type { TScoreProgressCallback } from "./types"

function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

export type TScoreSummary = {
	scored: number
	errors: number
	total: number
}

export type TBatchScoreOptions = {
	signal?: AbortSignal
	onProgress?: TScoreProgressCallback
	batchSize?: number
	rateLimitMs?: number
}

export async function runBatchScore(
	options: TBatchScoreOptions = {},
): Promise<TScoreSummary> {
	const { signal, onProgress, batchSize = 5, rateLimitMs = 500 } = options

	const result = listUnscoredRoles()
	if (!result.ok) {
		throw new Error(result.error.message)
	}

	const roles = result.data
	console.log(
		`[score] Found ${roles.length} unscored roles (batch size: ${batchSize})`,
	)

	if (roles.length === 0) {
		onProgress?.({ type: "score:done", scored: 0, errors: 0, total: 0 })
		return { scored: 0, errors: 0, total: 0 }
	}

	onProgress?.({ type: "score:start", total: roles.length })

	let scored = 0
	let errors = 0

	for (let i = 0; i < roles.length; i += batchSize) {
		if (signal?.aborted) break

		const chunk = roles.slice(i, i + batchSize)

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
				onProgress?.({
					type: "score:progress",
					current: scored + errors,
					total: roles.length,
					title: role.title,
				})
			} else {
				errors++
				console.warn(
					`[score] "${role.title}": ${scoreResult.error.message}`,
				)
				onProgress?.({
					type: "score:error",
					title: role.title,
					error: scoreResult.error.message,
				})
			}
		}

		if (i + batchSize < roles.length) {
			await delay(rateLimitMs)
		}
	}

	onProgress?.({ type: "score:done", scored, errors, total: roles.length })

	return { scored, errors, total: roles.length }
}
