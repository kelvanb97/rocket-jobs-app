import { runBatchScore } from "@rja-app/score/batch-score"
import type { TScoreProgressEvent } from "@rja-app/score/types"

export async function GET(request: Request) {
	const encoder = new TextEncoder()

	const stream = new ReadableStream({
		async start(controller) {
			const send = (event: TScoreProgressEvent) => {
				controller.enqueue(
					encoder.encode(`data: ${JSON.stringify(event)}\n\n`),
				)
			}

			try {
				await runBatchScore({
					signal: request.signal,
					onProgress: send,
				})
			} catch (err) {
				if (!request.signal.aborted) {
					const message =
						err instanceof Error ? err.message : String(err)
					controller.enqueue(
						encoder.encode(
							`data: ${JSON.stringify({ type: "error", error: message })}\n\n`,
						),
					)
				}
			} finally {
				controller.close()
			}
		},
	})

	return new Response(stream, {
		headers: {
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-cache",
			Connection: "keep-alive",
		},
	})
}
