"use client"

import { Button } from "@rja-design/ui/library/button"
import { Checkbox } from "@rja-design/ui/library/checkbox"
import { CopyPrompt } from "@rja-design/ui/library/copy-prompt"
import { Label } from "@rja-design/ui/library/label"
import { TextBody } from "@rja-design/ui/library/text"
import { XStack } from "@rja-design/ui/primitives/x-stack"
import { YStack } from "@rja-design/ui/primitives/y-stack"
import { useCallback, useEffect, useRef, useState } from "react"

type TSourceName =
	| "remoteok"
	| "weworkremotely"
	| "himalayas"
	| "jobicy"
	| "google-jobs"

const ALL_SOURCES: { name: TSourceName; label: string }[] = [
	{ name: "google-jobs", label: "Google Jobs" },
	{ name: "himalayas", label: "Himalayas" },
	{ name: "jobicy", label: "Jobicy" },
	{ name: "remoteok", label: "Remote OK" },
	{ name: "weworkremotely", label: "We Work Remotely" },
]

type LogEntry = {
	timestamp: string
	message: string
}

function formatTimestamp(): string {
	return new Date().toLocaleTimeString()
}

function formatScrapeEvent(data: Record<string, unknown>): string {
	switch (data["type"]) {
		case "source:start":
			return `Starting source: ${data["source"]}`
		case "source:found":
			return `[${data["source"]}] Found ${data["count"]} roles`
		case "source:role": {
			const status = data["status"] as string
			const title = data["title"] as string
			const company = data["company"] as string | null
			const label = company ? `${title} at ${company}` : title
			if (status === "inserted") return `[${data["source"]}] + ${label}`
			if (status === "duplicate")
				return `[${data["source"]}] = ${label} (duplicate)`
			if (status === "filtered")
				return `[${data["source"]}] ~ ${label} (filtered)`
			return `[${data["source"]}] - ${label} (${status})`
		}
		case "source:inserted":
			return `[${data["source"]}] Total: ${data["inserted"]} inserted, ${data["skipped"]} skipped`
		case "source:error":
			return `[${data["source"]}] Error: ${data["error"]}`
		case "source:done":
			return `[${data["source"]}] Done`
		case "done":
			return "Scrape complete"
		case "idle":
			return "No scrape in progress"
		case "error":
			return `Error: ${data["error"]}`
		default:
			return JSON.stringify(data)
	}
}

function connectToStatus(
	appendLog: (message: string) => void,
	eventCountRef: React.RefObject<number>,
	scrapeSourceRef: React.RefObject<EventSource | null>,
	setIsScraping: (v: boolean) => void,
) {
	const from = eventCountRef.current
	const eventSource = new EventSource(`/api/scrape/status?from=${from}`)
	scrapeSourceRef.current = eventSource

	eventSource.onmessage = (event) => {
		const data = JSON.parse(event.data) as Record<string, unknown>

		if (data["type"] === "idle") {
			eventSource.close()
			scrapeSourceRef.current = null
			setIsScraping(false)
			return
		}

		eventCountRef.current++
		appendLog(formatScrapeEvent(data))

		if (data["type"] === "done" || data["type"] === "error") {
			eventSource.close()
			scrapeSourceRef.current = null
			setIsScraping(false)
		}
	}

	eventSource.onerror = () => {
		eventSource.close()
		scrapeSourceRef.current = null
	}
}

export function OperationsTemplate() {
	const [selectedSources, setSelectedSources] = useState<Set<TSourceName>>(
		new Set(["google-jobs"]),
	)
	const [isScraping, setIsScraping] = useState(false)
	const [logs, setLogs] = useState<LogEntry[]>([])

	const scrapeSourceRef = useRef<EventSource | null>(null)
	const eventCountRef = useRef<number>(0)
	const logEndRef = useRef<HTMLDivElement>(null)

	const appendLog = useCallback((message: string) => {
		setLogs((prev) => [...prev, { timestamp: formatTimestamp(), message }])
	}, [])

	useEffect(() => {
		logEndRef.current?.scrollIntoView({ behavior: "smooth" })
	}, [logs])

	// On mount: check if a scrape is already running and reconnect
	useEffect(() => {
		fetch("/api/scrape/status?from=0", { method: "HEAD" }).catch(() => {})
		// Try connecting to see if there's an active scrape
		const eventSource = new EventSource("/api/scrape/status?from=0")
		eventSource.onmessage = (event) => {
			const data = JSON.parse(event.data) as Record<string, unknown>
			if (data["type"] === "idle") {
				eventSource.close()
				return
			}
			// Active scrape found — reconnect properly
			eventSource.close()
			setIsScraping(true)
			eventCountRef.current = 0
			connectToStatus(
				appendLog,
				eventCountRef,
				scrapeSourceRef,
				setIsScraping,
			)
		}
		eventSource.onerror = () => {
			eventSource.close()
		}

		return () => {
			eventSource.close()
			scrapeSourceRef.current?.close()
		}
	}, [appendLog])

	const toggleSource = (source: TSourceName, checked: boolean) => {
		setSelectedSources((prev) => {
			const next = new Set(prev)
			if (checked) {
				next.add(source)
			} else {
				next.delete(source)
			}
			return next
		})
	}

	const startScrape = async () => {
		if (selectedSources.size === 0) return

		const sources = Array.from(selectedSources).join(",")
		appendLog(`Starting scrape: ${sources}`)

		const response = await fetch("/api/scrape", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ sources }),
		})

		const data = (await response.json()) as Record<string, unknown>

		if (!response.ok) {
			appendLog(`Failed to start: ${data["error"]}`)
			return
		}

		setIsScraping(true)
		eventCountRef.current = 0
		connectToStatus(
			appendLog,
			eventCountRef,
			scrapeSourceRef,
			setIsScraping,
		)
	}

	const cancelScrape = async () => {
		scrapeSourceRef.current?.close()
		scrapeSourceRef.current = null

		await fetch("/api/scrape/cancel", { method: "POST" })

		setIsScraping(false)
		appendLog("Scrape cancelled")
	}

	return (
		<YStack className="gap-8">
			{/* Scrape Section */}
			<YStack className="gap-4">
				<TextBody
					size="lg"
					variant="foreground"
					className="font-semibold"
				>
					Scrape Jobs
				</TextBody>
				<XStack className="flex-wrap gap-4">
					{ALL_SOURCES.map(({ name, label }) => (
						<XStack key={name} className="items-center gap-2">
							<Checkbox
								id={`source-${name}`}
								checked={selectedSources.has(name)}
								onCheckedChange={(checked) =>
									toggleSource(name, checked === true)
								}
								disabled={isScraping}
							/>
							<Label htmlFor={`source-${name}`}>{label}</Label>
						</XStack>
					))}
				</XStack>
				<XStack className="gap-2">
					<Button
						onClick={startScrape}
						disabled={isScraping || selectedSources.size === 0}
					>
						{isScraping ? "Scraping..." : "Scrape"}
					</Button>
					{isScraping && (
						<Button variant="outline" onClick={cancelScrape}>
							Cancel
						</Button>
					)}
				</XStack>
			</YStack>

			{/* Score Section */}
			<YStack className="gap-4">
				<TextBody
					size="lg"
					variant="foreground"
					className="font-semibold"
				>
					Score Roles
				</TextBody>
				<CopyPrompt value="/score-role" />
			</YStack>

			{/* Log Area */}
			<YStack className="gap-2">
				<XStack className="items-center justify-between">
					<TextBody
						size="lg"
						variant="foreground"
						className="font-semibold"
					>
						Log
					</TextBody>
					{logs.length > 0 && (
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setLogs([])}
						>
							Clear
						</Button>
					)}
				</XStack>
				<div className="h-80 overflow-y-auto rounded-md border bg-muted/30 p-3 font-mono text-xs">
					{logs.length === 0 ? (
						<TextBody
							size="xs"
							variant="muted-foreground"
							className="font-mono"
						>
							No activity yet. Start a scrape operation.
						</TextBody>
					) : (
						logs.map((entry, i) => (
							<div key={i} className="py-0.5">
								<span className="text-muted-foreground">
									{entry.timestamp}
								</span>{" "}
								{entry.message}
							</div>
						))
					)}
					<div ref={logEndRef} />
				</div>
			</YStack>
		</YStack>
	)
}
