import { downloadDocuments } from "@rja-app/apply/download-documents"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
	try {
		const body = (await request.json()) as {
			resumePath: string
			coverLetterPath: string
		}

		if (!body.resumePath || !body.coverLetterPath) {
			return NextResponse.json(
				{ error: "resumePath and coverLetterPath are required" },
				{ status: 400 },
			)
		}

		const result = downloadDocuments({
			resumePath: body.resumePath,
			coverLetterPath: body.coverLetterPath,
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
