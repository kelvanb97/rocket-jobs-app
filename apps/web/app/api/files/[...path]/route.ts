import { existsSync, readFileSync } from "node:fs"
import { join, resolve } from "node:path"
import { NextResponse, type NextRequest } from "next/server"

const MIME_TYPES: Record<string, string> = {
	".pdf": "application/pdf",
	".docx":
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	".png": "image/png",
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
}

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ path: string[] }> },
) {
	const { path } = await params

	const filePath = resolve(process.cwd(), "../../data/storage", join(...path))

	if (!existsSync(filePath)) {
		return NextResponse.json({ error: "File not found" }, { status: 404 })
	}

	const ext = filePath.slice(filePath.lastIndexOf(".")).toLowerCase()
	const mimeType = MIME_TYPES[ext] ?? "application/octet-stream"

	const buffer = readFileSync(filePath)

	return new NextResponse(buffer, {
		headers: { "Content-Type": mimeType },
	})
}
