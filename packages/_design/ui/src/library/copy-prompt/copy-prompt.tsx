"use client"

import { Check, Copy } from "#assets/lucide/lucide"
import { cn } from "#utils/cn"
import { useCallback, useState } from "react"

export function CopyPrompt({
	value,
	className,
}: {
	value: string
	className?: string
}) {
	const [copied, setCopied] = useState(false)

	const handleCopy = useCallback(() => {
		navigator.clipboard.writeText(value)
		setCopied(true)
		setTimeout(() => setCopied(false), 2000)
	}, [value])

	return (
		<div
			className={cn(
				"inline-flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-1.5",
				className,
			)}
		>
			<code className="text-sm font-mono text-muted-foreground select-all">
				{value}
			</code>
			<button
				type="button"
				onClick={handleCopy}
				className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
				aria-label={copied ? "Copied" : "Copy to clipboard"}
			>
				{copied ? (
					<Check className="size-3.5 text-green-600" />
				) : (
					<Copy className="size-3.5" />
				)}
			</button>
		</div>
	)
}
