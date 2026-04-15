"use client"

import { Button } from "@rja-design/ui/library/button"
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@rja-design/ui/library/dialog"
import { YStack } from "@rja-design/ui/primitives/y-stack"
import { renderAsync } from "docx-preview"
import { useCallback, useEffect, useState } from "react"

interface IDocumentViewerDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	url: string | null
	title: string
}

type TDocKind = "pdf" | "docx" | "image" | "unknown"

function kindFromUrl(url: string | null): TDocKind {
	if (!url) return "unknown"
	const pathname = url.split("?")[0] ?? ""
	const ext = pathname.slice(pathname.lastIndexOf(".")).toLowerCase()
	if (ext === ".pdf") return "pdf"
	if (ext === ".docx") return "docx"
	if (ext === ".png" || ext === ".jpg" || ext === ".jpeg") return "image"
	return "unknown"
}

export function DocumentViewerDialog({
	open,
	onOpenChange,
	url,
	title,
}: IDocumentViewerDialogProps) {
	const kind = kindFromUrl(url)
	const [container, setContainer] = useState<HTMLDivElement | null>(null)
	const [docxLoading, setDocxLoading] = useState(false)
	const [docxError, setDocxError] = useState<string | null>(null)

	const containerRef = useCallback((node: HTMLDivElement | null) => {
		setContainer(node)
	}, [])

	useEffect(() => {
		if (!open || kind !== "docx" || !url || !container) return

		let cancelled = false
		container.innerHTML = ""
		setDocxError(null)
		setDocxLoading(true)

		fetch(url)
			.then((res) => {
				if (!res.ok) throw new Error(`Failed to fetch (${res.status})`)
				return res.arrayBuffer()
			})
			.then((buffer) => {
				if (cancelled) return
				return renderAsync(buffer, container, undefined, {
					className: "docx-preview",
					inWrapper: true,
				})
			})
			.then(() => {
				if (!cancelled) setDocxLoading(false)
			})
			.catch((err: unknown) => {
				if (cancelled) return
				setDocxLoading(false)
				setDocxError(
					err instanceof Error ? err.message : "Preview failed",
				)
			})

		return () => {
			cancelled = true
		}
	}, [open, url, kind, container])

	const downloadHref = url ? `${url}?download=1` : undefined

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-4xl h-[85vh] flex flex-col gap-4 p-4">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>
				{url && kind === "pdf" && (
					<iframe src={url} title={title} className="w-full h-full" />
				)}
				{url && kind === "image" && (
					<div className="w-full h-full flex items-center justify-center p-2">
						<img
							src={url}
							alt={title}
							className="max-w-full max-h-full object-contain"
						/>
					</div>
				)}
				{url && kind === "docx" && (
					<div className="h-full w-full overflow-auto p-4">
						{docxLoading && (
							<p className="text-sm text-muted-foreground">
								Loading preview...
							</p>
						)}
						{docxError && (
							<p className="text-sm text-destructive">
								Preview failed — use Download below.
							</p>
						)}
						<div ref={containerRef} />
					</div>
				)}
				{url && kind === "unknown" && (
					<YStack className="items-center justify-center h-full p-6 text-sm text-muted-foreground">
						Preview not supported for this file type. Use Download
						below.
					</YStack>
				)}
				<div className="flex justify-end">
					{downloadHref && (
						<Button asChild>
							<a href={downloadHref} download>
								Download
							</a>
						</Button>
					)}
				</div>
			</DialogContent>
		</Dialog>
	)
}
