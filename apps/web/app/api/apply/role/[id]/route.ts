import { getRoleForApply } from "@rja-app/apply/get-role-for-apply"
import { NextResponse } from "next/server"

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params
		const roleId = Number(id)
		if (!Number.isFinite(roleId) || roleId <= 0) {
			return NextResponse.json(
				{ error: "Invalid role id" },
				{ status: 400 },
			)
		}

		const result = getRoleForApply(roleId)
		if (!result.ok) {
			return NextResponse.json(
				{ error: result.error.message },
				{ status: 500 },
			)
		}

		if (!result.data) {
			return NextResponse.json(
				{ error: "Role not found" },
				{ status: 404 },
			)
		}

		return NextResponse.json({ data: result.data })
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err)
		return NextResponse.json({ error: message }, { status: 500 })
	}
}
