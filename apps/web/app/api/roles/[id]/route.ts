import { getCompany } from "@rja-api/company/api/get-company"
import { getRole } from "@rja-api/role/api/get-role"
import { NextResponse } from "next/server"

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params
		const roleResult = getRole(Number(id))
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

		return NextResponse.json({
			data: {
				...role,
				description: role.description?.slice(0, 4000) ?? null,
				company,
			},
		})
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err)
		return NextResponse.json({ error: message }, { status: 500 })
	}
}
