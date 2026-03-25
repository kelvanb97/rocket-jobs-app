"use client"

import { Button } from "@aja-design/ui/library/button"
import { Checkbox } from "@aja-design/ui/library/checkbox"
import { Label } from "@aja-design/ui/library/label"
import { TextBody } from "@aja-design/ui/library/text"
import { XStack } from "@aja-design/ui/primitives/x-stack"
import { YStack } from "@aja-design/ui/primitives/y-stack"
import { useCallback, useEffect, useRef, useState } from "react"

type TSourceName =
	| "remoteok"
	| "weworkremotely"
	| "himalayas"
	| "jobicy"
	| "google-jobs"
	| "jobright"


const ALL_SOURCES: { name: TSourceName; label: string }[] = [
	{ name: "google-jobs", label: "Google Jobs" },
	{ name: "jobright", label: "Jobright" },
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
		case "source:inserted":
			return `[${data["source"]}] Inserted ${data["inserted"]}, skipped ${data["skipped"]}`
		case "source:error":
			return `[${data["source"]}] Error: ${data["error"]}`
		case "source:done":
			return `[${data["source"]}] Done`
		case "done":
			return "Scrape complete"
		case "error":
			return `Error: ${data["error"]}`
		default:
			return JSON.stringify(data)
	}
}

function formatScoreEvent(data: Record<string, unknown>): string {
	switch (data["type"]) {
		case "score:start":
			return `Scoring ${data["total"]} unscored roles...`
		case "score:progress":
			return `[${data["current"]}/${data["total"]}] Scored "${data["title"]}"`
		case "score:error":
			return `Error scoring "${data["title"]}": ${data["error"]}`
		case "score:done":
			return `Scoring complete: ${data["scored"]} scored, ${data["errors"]} errors out of ${data["total"]}`
		case "error":
			return `Error: ${data["error"]}`
		default:
			return JSON.stringify(data)
	}
}

export function OperationsTemplate() {
	const [selectedSources, setSelectedSources] = useState<Set<TSourceName>>(
		new Set(["google-jobs"]),
	)
	const [isScraping, setIsScraping] = useState(false)
	const [isScoring, setIsScoring] = useState(false)
	const [logs, setLogs] = useState<LogEntry[]>([])

	const scrapeSourceRef = useRef<EventSource | null>(null)
	const scoreSourceRef = useRef<EventSource | null>(null)
	const logEndRef = useRef<HTMLDivElement>(null)

	const appendLog = useCallback((message: string) => {
		setLogs((prev) => [...prev, { timestamp: formatTimestamp(), message }])
	}, [])

	useEffect(() => {
		logEndRef.current?.scrollIntoView({ behavior: "smooth" })
	}, [logs])

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			scrapeSourceRef.current?.close()
			scoreSourceRef.current?.close()
		}
	}, [])

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

	const startScrape = () => {
		if (selectedSources.size === 0) return

		setIsScraping(true)
		const sources = Array.from(selectedSources).join(",")
		appendLog(`Starting scrape: ${sources}`)

		const eventSource = new EventSource(`/api/scrape?sources=${sources}`)
		scrapeSourceRef.current = eventSource

		eventSource.onmessage = (event) => {
			const data = JSON.parse(event.data) as Record<string, unknown>
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
			if (isScraping) {
				appendLog("Scrape connection closed")
				setIsScraping(false)
			}
		}
	}

	const cancelScrape = () => {
		scrapeSourceRef.current?.close()
		scrapeSourceRef.current = null
		setIsScraping(false)
		appendLog("Scrape cancelled")
	}

	const startScore = () => {
		setIsScoring(true)
		appendLog("Starting batch score...")

		const eventSource = new EventSource("/api/score")
		scoreSourceRef.current = eventSource

		eventSource.onmessage = (event) => {
			const data = JSON.parse(event.data) as Record<string, unknown>
			appendLog(formatScoreEvent(data))
			if (data["type"] === "score:done" || data["type"] === "error") {
				eventSource.close()
				scoreSourceRef.current = null
				setIsScoring(false)
			}
		}

		eventSource.onerror = () => {
			eventSource.close()
			scoreSourceRef.current = null
			if (isScoring) {
				appendLog("Score connection closed")
				setIsScoring(false)
			}
		}
	}

	const cancelScore = () => {
		scoreSourceRef.current?.close()
		scoreSourceRef.current = null
		setIsScoring(false)
		appendLog("Score cancelled")
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
						disabled={
							isScraping ||
							isScoring ||
							selectedSources.size === 0
						}
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
				<XStack className="gap-2">
					<Button
						onClick={startScore}
						disabled={isScoring || isScraping}
					>
						{isScoring ? "Scoring..." : "Score All Unscored"}
					</Button>
					{isScoring && (
						<Button variant="outline" onClick={cancelScore}>
							Cancel
						</Button>
					)}
				</XStack>
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
							No activity yet. Start a scrape or score operation.
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
