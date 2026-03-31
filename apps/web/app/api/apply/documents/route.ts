import { listDocuments } from "@rja-app/apply/list-documents"
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

		const result = listDocuments(Number(roleId))

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
