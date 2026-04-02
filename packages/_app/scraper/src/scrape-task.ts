import type { TSourceName } from "@rja-api/settings/schema/scraper-config-schema"
import { runScraper } from "#scrape"
import type { TScrapeProgressEvent } from "#types"

type Listener = (event: TScrapeProgressEvent) => void

let running = false
let events: TScrapeProgressEvent[] = []
let controller: AbortController | null = null
const listeners = new Set<Listener>()

function emit(event: TScrapeProgressEvent) {
	events.push(event)
	for (const listener of listeners) {
		listener(event)
	}
}

export function startScrape(sources?: TSourceName[]): {
	ok: boolean
	error?: string
} {
	if (running) return { ok: false, error: "Scrape already in progress" }

	running = true
	events = []
	controller = new AbortController()

	const scrapeOptions = {
		...(sources ? { sources } : {}),
		signal: controller.signal,
		onProgress: emit,
	}

	runScraper(scrapeOptions)
		.catch((err) => {
			const message = err instanceof Error ? err.message : String(err)
			emit({ type: "source:error", source: "scraper", error: message })
		})
		.finally(() => {
			running = false
			controller = null
		})

	return { ok: true }
}

export function getScrapeStatus(): {
	running: boolean
	eventCount: number
} {
	return { running, eventCount: events.length }
}

export function subscribe(listener: Listener, fromIndex = 0): () => void {
	// Replay past events
	for (let i = fromIndex; i < events.length; i++) {
		listener(events[i]!)
	}

	listeners.add(listener)

	return () => {
		listeners.delete(listener)
	}
}

export function cancelScrape(): { ok: boolean } {
	if (!running || !controller) return { ok: false }
	controller.abort()
	return { ok: true }
}
