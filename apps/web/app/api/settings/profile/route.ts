import { getScoringConfig } from "@rja-api/settings/api/get-scoring-config"
import { getUserProfile } from "@rja-api/settings/api/get-user-profile"
import { NextResponse } from "next/server"

export async function GET() {
	try {
		const profileResult = getUserProfile()
		if (!profileResult.ok) {
			return NextResponse.json(
				{ error: profileResult.error.message },
				{ status: 500 },
			)
		}

		const scoringResult = getScoringConfig()
		const scoringWeights =
			scoringResult.ok && scoringResult.data
				? {
						titleAndSeniority: scoringResult.data.titleAndSeniority,
						skills: scoringResult.data.skills,
						salary: scoringResult.data.salary,
						location: scoringResult.data.location,
						industry: scoringResult.data.industry,
					}
				: {
						titleAndSeniority: "medium",
						skills: "medium",
						salary: "medium",
						location: "medium",
						industry: "medium",
					}

		return NextResponse.json({
			data: {
				profile: profileResult.data,
				scoringWeights,
			},
		})
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err)
		return NextResponse.json({ error: message }, { status: 500 })
	}
}
