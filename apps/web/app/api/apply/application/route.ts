import { createDraft } from "@aja-app/apply/create-draft"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
	try {
		const body = (await request.json()) as {
			roleId: string
			notes?: string
		}

		if (!body.roleId) {
			return NextResponse.json(
				{ error: "roleId is required" },
				{ status: 400 },
			)
		}

		const result = createDraft({
			roleId: Number(body.roleId),
			notes: body.notes,
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
