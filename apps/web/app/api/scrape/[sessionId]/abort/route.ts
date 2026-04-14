import { NextResponse } from "next/server"
import { getSession, serializeSessionSnapshot } from "../../_lib/session-store"

type TRouteContext = {
	params: Promise<{
		sessionId: string
	}>
}

export async function POST(_request: Request, context: TRouteContext) {
	const { sessionId } = await context.params
	const session = getSession(sessionId)
	if (!session) {
		return NextResponse.json(
			{ error: "Scrape session not found." },
			{ status: 404 },
		)
	}

	const snapshot = await session.abort()
	return NextResponse.json({
		data: serializeSessionSnapshot(snapshot),
	})
}
