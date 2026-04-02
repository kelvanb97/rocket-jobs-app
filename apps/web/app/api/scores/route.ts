import { upsertScore } from "@rja-api/score/api/upsert-score"
import { upsertScoreSchema } from "@rja-api/score/schema/score-schema"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
	try {
		const body = await request.json()
		const parsed = upsertScoreSchema.parse(body)
		const result = upsertScore(parsed)

		if (!result.ok) {
			return NextResponse.json(
				{ error: result.error.message },
				{ status: 500 },
			)
		}

		return NextResponse.json({ data: result.data })
	} catch (err) {
		if (err instanceof Error && err.name === "ZodError") {
			return NextResponse.json(
				{ error: "Validation failed", details: err },
				{ status: 400 },
			)
		}
		const message = err instanceof Error ? err.message : String(err)
		return NextResponse.json({ error: message }, { status: 500 })
	}
}
