import {
	getOrCreateActiveSession,
	startResponseFromSnapshot,
} from "./_lib/session-store"

export async function GET(request: Request) {
	try {
		const session = getOrCreateActiveSession()
		const snapshot = await Promise.race([
			session.waitForVisibleState(),
			new Promise<never>((_, reject) => {
				request.signal.addEventListener("abort", () => {
					reject(new Error("Request aborted"))
				})
			}),
		])

		return startResponseFromSnapshot(snapshot)
	} catch (err) {
		if (request.signal.aborted) {
			return new Response(null, { status: 499 })
		}
		const message = err instanceof Error ? err.message : String(err)
		return Response.json({ error: message }, { status: 500 })
	}
}
