import { listUnscoredRoles } from "@rja-api/role/api/list-unscored-roles"
import { NextResponse } from "next/server"

export async function GET() {
	try {
		const result = listUnscoredRoles()
		if (!result.ok) {
			return NextResponse.json(
				{ error: result.error.message },
				{ status: 500 },
			)
		}
		return NextResponse.json({
			data: result.data.map((role) => ({
				id: role.id,
				title: role.title,
			})),
		})
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err)
		return NextResponse.json({ error: message }, { status: 500 })
	}
}
