import { getTopRole } from "@aja-app/apply/get-top-role"
import { NextResponse } from "next/server"

export async function GET() {
	try {
		const result = getTopRole()

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
