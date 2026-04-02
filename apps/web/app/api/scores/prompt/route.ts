import { getCompany } from "@rja-api/company/api/get-company"
import { getRole } from "@rja-api/role/api/get-role"
import { buildScoringPrompt } from "@rja-api/score/api/build-scoring-prompt"
import { getScoringConfig } from "@rja-api/settings/api/get-scoring-config"
import { getUserProfile } from "@rja-api/settings/api/get-user-profile"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url)
		const roleId = searchParams.get("roleId")

		if (!roleId) {
			return NextResponse.json(
				{ error: "roleId query parameter is required" },
				{ status: 400 },
			)
		}

		const roleResult = getRole(Number(roleId))
		if (!roleResult.ok) {
			return NextResponse.json(
				{ error: roleResult.error.message },
				{ status: 404 },
			)
		}
		const role = roleResult.data

		let company = null
		if (role.companyId) {
			const companyResult = getCompany(role.companyId)
			if (companyResult.ok) company = companyResult.data
		}

		const profileResult = getUserProfile()
		if (!profileResult.ok) {
			return NextResponse.json(
				{ error: profileResult.error.message },
				{ status: 500 },
			)
		}

		const scoringResult = getScoringConfig()
		if (!scoringResult.ok || !scoringResult.data) {
			return NextResponse.json(
				{ error: "Scoring config not found" },
				{ status: 500 },
			)
		}

		const prompt = buildScoringPrompt(
			role,
			company,
			profileResult.data,
			scoringResult.data,
		)

		return NextResponse.json({ data: prompt })
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err)
		return NextResponse.json({ error: message }, { status: 500 })
	}
}
