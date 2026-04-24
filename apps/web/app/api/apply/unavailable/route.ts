import { markRoleUnavailable } from "@rja-app/apply/mark-role-unavailable"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
	try {
		const body = (await request.json()) as {
			roleId: string
			reason?: string
		}

		if (!body.roleId) {
			return NextResponse.json(
				{ error: "roleId is required" },
				{ status: 400 },
			)
		}

		const result = markRoleUnavailable({
			roleId: Number(body.roleId),
			reason: body.reason,
		})

		if (!result.ok) {
			return NextResponse.json(
				{ error: result.error.message },
				{ status: 500 },
			)
		}

		return NextResponse.json({ ok: true })
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err)
		return NextResponse.json({ error: message }, { status: 500 })
	}
}
