import { stdin, stdout } from "node:process"
import { createInterface } from "node:readline/promises"
import { getCompany } from "@aja-api/company/api/get-company"
import { getRole } from "@aja-api/role/api/get-role"
import { listUnscoredRoles } from "@aja-api/role/api/list-unscored-roles"
import type { TRole } from "@aja-api/role/schema/role-schema"
import { USER_PROFILE } from "@aja-api/score/config/profile"
import { buildScoringPrompt } from "@aja-api/score/prompt/scoring-prompt"
import { convert } from "html-to-text"
import {
	loadDataset,
	loadEvalSet,
	saveEvalExample,
	saveLabel,
} from "./dataset.js"

function getArg(flag: string): string | undefined {
	const idx = process.argv.indexOf(flag)
	return idx !== -1 ? process.argv[idx + 1] : undefined
}

function formatRoleForDisplay(role: TRole, companyName: string | null): string {
	const lines = [
		"─".repeat(60),
		`Title: ${role.title}`,
		companyName ? `Company: ${companyName}` : null,
		`Location: ${role.locationType ?? "N/A"}${role.location ? ` · ${role.location}` : ""}`,
		formatSalary(role.salaryMin, role.salaryMax),
		role.source ? `Source: ${role.source}` : null,
		role.description
			? `\nDescription:\n${formatDescription(role.description)}`
			: null,
		"─".repeat(60),
	]

	return lines.filter(Boolean).join("\n")
}

function formatDescription(description: string): string {
	const isHtml = /<[a-z][\s\S]*>/i.test(description)
	const text = isHtml ? convert(description, { wordwrap: 80 }) : description
	const trimmed = text.slice(0, 1500)
	return trimmed.length < text.length ? trimmed + "\n..." : trimmed
}

function formatSalary(min: number | null, max: number | null): string {
	if (min === null && max === null) return "Salary: Not listed"
	const fmt = (n: number) => `$${Math.round(n / 1000)}k`
	if (min !== null && max !== null) return `Salary: ${fmt(min)} - ${fmt(max)}`
	if (min !== null) return `Salary: ${fmt(min)}+`
	return `Salary: Up to ${fmt(max!)}`
}

export async function runLabeler(): Promise<void> {
	const count = Number(getArg("--count") || "10")

	const result = await listUnscoredRoles()
	if (!result.ok) {
		throw new Error(result.error.message)
	}

	const roles = result.data.slice(0, count)

	if (roles.length === 0) {
		console.log("No unscored roles to label.")
		return
	}

	console.log(
		`\nLabeling ${roles.length} roles. Type "skip" to skip, "quit" to stop.\n`,
	)

	const rl = createInterface({ input: stdin, output: stdout })

	try {
		for (let i = 0; i < roles.length; i++) {
			const role = roles[i]!
			const company = role.companyId
				? await getCompany(role.companyId).then((r) =>
						r.ok ? r.data : null,
					)
				: null
			const companyName = company?.name ?? null

			console.log(`\n[${i + 1}/${roles.length}]`)
			console.log(formatRoleForDisplay(role, companyName))

			const scoreInput = await rl.question("Score (0-100): ")
			if (scoreInput.toLowerCase() === "quit") break
			if (scoreInput.toLowerCase() === "skip") continue

			const score = Number(scoreInput)
			if (isNaN(score) || score < 0 || score > 100) {
				console.log("Invalid score, skipping.")
				continue
			}

			if (score === 0) {
				const labeledAt = new Date().toISOString()
				await saveLabel({
					roleId: role.id,
					humanScore: 0,
					isTitleFit: false,
					isSeniorityAppropriate: false,
					doSkillsAlign: false,
					isLocationAcceptable: false,
					isSalaryAcceptable: false,
					labeledAt,
				})
				const { user: userMessage } = buildScoringPrompt(
					role,
					company,
					USER_PROFILE,
				)
				await saveEvalExample({
					roleId: role.id,
					title: role.title,
					userMessage,
					humanScore: 0,
					isTitleFit: false,
					isSeniorityAppropriate: false,
					doSkillsAlign: false,
					isLocationAcceptable: false,
					isSalaryAcceptable: false,
					labeledAt,
				})
				console.log(`Saved: score=0 (binary fields skipped)`)
				continue
			}

			const yn = (s: string) => s.trim().toLowerCase() === "y"

			const isTitleFit = yn(await rl.question("Title fit? (y/n): "))
			const isSeniorityAppropriate = yn(
				await rl.question("Seniority appropriate? (y/n): "),
			)
			const doSkillsAlign = yn(await rl.question("Skills align? (y/n): "))
			const isLocationAcceptable = yn(
				await rl.question("Location acceptable? (y/n): "),
			)
			const isSalaryAcceptable = yn(
				await rl.question("Salary acceptable? (y/n): "),
			)

			await saveLabel({
				roleId: role.id,
				humanScore: score,
				isTitleFit,
				isSeniorityAppropriate,
				doSkillsAlign,
				isLocationAcceptable,
				isSalaryAcceptable,
				labeledAt: new Date().toISOString(),
			})

			const { user: userMessage } = buildScoringPrompt(
				role,
				company,
				USER_PROFILE,
			)
			await saveEvalExample({
				roleId: role.id,
				title: role.title,
				userMessage,
				humanScore: score,
				isTitleFit,
				isSeniorityAppropriate,
				doSkillsAlign,
				isLocationAcceptable,
				isSalaryAcceptable,
				labeledAt: new Date().toISOString(),
			})

			console.log(`Saved: score=${score}`)
		}
	} finally {
		rl.close()
	}

	console.log("\nLabeling session complete.")
}

export async function runBackfill(): Promise<void> {
	console.log("[backfill] Loading labeled roles and eval set...")
	const dataset = await loadDataset()
	const evalSet = await loadEvalSet()
	const evalSetIds = new Set(evalSet.map((e) => e.roleId))

	const missing = dataset.filter((l) => !evalSetIds.has(l.roleId))

	if (missing.length === 0) {
		console.log("[backfill] Eval set is already up to date.")
		return
	}

	console.log(`[backfill] Backfilling ${missing.length} entries...`)

	for (const label of missing) {
		const roleResult = await getRole(label.roleId)
		if (!roleResult.ok) {
			console.warn(
				`[backfill] Could not fetch role ${label.roleId}, skipping`,
			)
			continue
		}

		const role = roleResult.data
		const company = role.companyId
			? await getCompany(role.companyId).then((r) =>
					r.ok ? r.data : null,
				)
			: null

		const { user: userMessage } = buildScoringPrompt(
			role,
			company,
			USER_PROFILE,
		)
		await saveEvalExample({
			roleId: role.id,
			title: role.title,
			userMessage,
			humanScore: label.humanScore,
			isTitleFit: label.isTitleFit,
			isSeniorityAppropriate: label.isSeniorityAppropriate,
			doSkillsAlign: label.doSkillsAlign,
			isLocationAcceptable: label.isLocationAcceptable,
			isSalaryAcceptable: label.isSalaryAcceptable,
			labeledAt: label.labeledAt,
		})

		console.log(`[backfill] Saved: ${role.title}`)
	}

	console.log("[backfill] Done.")
}
