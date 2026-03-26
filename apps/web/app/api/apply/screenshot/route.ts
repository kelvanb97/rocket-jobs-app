import { uploadScreenshot } from "@aja-app/apply/upload-screenshot"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
	try {
		const body = (await request.json()) as {
			roleId: string
			applicationId: string
			localPath: string
		}

		if (!body.roleId || !body.applicationId || !body.localPath) {
			return NextResponse.json(
				{ error: "roleId, applicationId, and localPath are required" },
				{ status: 400 },
			)
		}

		const result = await uploadScreenshot({
			roleId: body.roleId,
			applicationId: body.applicationId,
			localPath: body.localPath,
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
