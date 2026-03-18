import { scoreRole } from "@aja-api/score/lib/claude-client"
import type { TAnthropicModel } from "@aja-integrations/anthropic/client"
import { loadEvalSet } from "../../src/eval/dataset.js"
import systemPrompt from "../artifact/current.ts"

const SCORER_MODEL = (process.env["SCORER_MODEL"] ??
	"claude-haiku-4-5-20251001") as TAnthropicModel
const RATE_LIMIT_MS = Number(process.env["SCORER_RATE_LIMIT_MS"] ?? "500")

const evalSet = await loadEvalSet()

if (evalSet.length === 0) {
	console.error(
		"[eval-ar] No eval examples found. Run `pnpm backfill-eval` first.",
	)
	process.exit(1)
}

const BINARY_FIELDS = [
	"isTitleFit",
	"isSeniorityAppropriate",
	"doSkillsAlign",
	"isLocationAcceptable",
	"isSalaryAcceptable",
] as const

let totalAbsError = 0
const fieldCorrect: Record<(typeof BINARY_FIELDS)[number], number> = {
	isTitleFit: 0,
	isSeniorityAppropriate: 0,
	doSkillsAlign: 0,
	isLocationAcceptable: 0,
	isSalaryAcceptable: 0,
}

for (const example of evalSet) {
	const result = await scoreRole(
		SCORER_MODEL,
		systemPrompt,
		example.userMessage,
	)
	const diff = Math.abs(result.score - example.humanScore)
	totalAbsError += diff

	for (const field of BINARY_FIELDS) {
		if (result[field] === example[field]) {
			fieldCorrect[field]++
		}
	}

	console.error(
		`  ${example.title}: human=${example.humanScore} model=${result.score} diff=${diff}`,
	)
	await new Promise((r) => setTimeout(r, RATE_LIMIT_MS))
}

const mae = totalAbsError / evalSet.length
const totalBinaryPredictions = evalSet.length * BINARY_FIELDS.length
const totalCorrect = Object.values(fieldCorrect).reduce((a, b) => a + b, 0)
const binaryAccuracy = totalCorrect / totalBinaryPredictions

console.error("\nPer-field accuracy:")
for (const field of BINARY_FIELDS) {
	const acc = fieldCorrect[field] / evalSet.length
	console.error(`  ${field}: ${(acc * 100).toFixed(1)}%`)
}
console.error(`Binary accuracy: ${(binaryAccuracy * 100).toFixed(1)}%`)
console.error(`Score MAE: ${mae.toFixed(2)}`)

const composite = mae + (1 - binaryAccuracy) * 20
console.log(composite.toFixed(2))
