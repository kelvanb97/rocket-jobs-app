import { getScrapeStatus, subscribe } from "@rja-app/scraper/scrape-task"
import type { TScrapeProgressEvent } from "@rja-app/scraper/types"

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url)
	const fromIndex = Number(searchParams.get("from") ?? "0")

	const encoder = new TextEncoder()

	const stream = new ReadableStream({
		start(controller) {
			const status = getScrapeStatus()

			// If not running and no events to replay, send status and close
			if (!status.running && fromIndex >= status.eventCount) {
				controller.enqueue(
					encoder.encode(
						`data: ${JSON.stringify({ type: "idle", ...status })}\n\n`,
					),
				)
				controller.close()
				return
			}

			const send = (event: TScrapeProgressEvent) => {
				try {
					controller.enqueue(
						encoder.encode(`data: ${JSON.stringify(event)}\n\n`),
					)

					// Close stream after done event
					if (event.type === "done") {
						unsubscribe()
						controller.close()
					}
				} catch {
					// Client disconnected — just unsubscribe, scraper keeps running
					unsubscribe()
				}
			}

			const unsubscribe = subscribe(send, fromIndex)

			// Clean up on client disconnect
			request.signal.addEventListener("abort", () => {
				unsubscribe()
			})
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
