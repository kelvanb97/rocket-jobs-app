import { generateDocuments } from "@rja-app/apply/generate-documents"
import { NextResponse } from "next/server"

export const maxDuration = 180

export async function POST(request: Request) {
	try {
		const body = (await request.json()) as {
			roleId: string
			applicationId: string
		}

		if (!body.roleId || !body.applicationId) {
			return NextResponse.json(
				{ error: "roleId and applicationId are required" },
				{ status: 400 },
			)
		}

		const result = await generateDocuments({
			roleId: Number(body.roleId),
			applicationId: Number(body.applicationId),
		})

		if (!result.ok) {
			return NextResponse.json(
				{ error: result.error.message },
				{ status: 500 },
			)
		}

		return NextResponse.json({ data: result.data })
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err)
		return NextResponse.json({ error: message }, { status: 500 })
	}
}
