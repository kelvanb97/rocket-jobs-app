import type { TSourceName } from "@rja-api/settings/schema/scraper-config-schema"
import { runScraper } from "@rja-app/scraper/scrape"
import type { TScrapeProgressEvent } from "@rja-app/scraper/types"

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url)
	const sourcesParam = searchParams.get("sources")
	const sources = sourcesParam
		? (sourcesParam.split(",") as TSourceName[])
		: undefined

	const encoder = new TextEncoder()

	const stream = new ReadableStream({
		async start(controller) {
			const send = (event: TScrapeProgressEvent) => {
				controller.enqueue(
					encoder.encode(`data: ${JSON.stringify(event)}\n\n`),
				)
			}

			try {
				const options = sources
					? { sources, signal: request.signal, onProgress: send }
					: { signal: request.signal, onProgress: send }
				await runScraper(options)
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
