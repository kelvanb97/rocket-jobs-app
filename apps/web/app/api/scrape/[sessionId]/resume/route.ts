import { NextResponse } from "next/server"
import { getSession, serializeSessionSnapshot } from "../../_lib/session-store"

type TRouteContext = {
	params: Promise<{
		sessionId: string
	}>
}

type TResumeBody = {
	actor?: "harness" | "user"
}

export async function POST(request: Request, context: TRouteContext) {
	const { sessionId } = await context.params
	const session = getSession(sessionId)
	if (!session) {
		return NextResponse.json(
			{ error: "Scrape session not found." },
			{ status: 404 },
		)
	}

	try {
		const body = (await request.json().catch(() => ({}))) as TResumeBody
		const snapshot = await session.resume(body.actor ?? "user")
		return NextResponse.json({
			data: serializeSessionSnapshot(snapshot),
		})
	} catch (err) {
		const snapshot = session.getSnapshot()
		if (snapshot.status === "handoff_required" && snapshot.handoff) {
			return NextResponse.json(
				{
					error: "handoff_required",
					handoff: {
						sessionId: snapshot.id,
						...snapshot.handoff,
					},
				},
				{ status: 409 },
			)
		}

		const message = err instanceof Error ? err.message : String(err)
		return NextResponse.json({ error: message }, { status: 500 })
	}
}
