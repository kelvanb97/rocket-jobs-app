"use client"

import { Check, Copy } from "#assets/lucide/lucide"
import { HarnessLogo, type THarness } from "#library/harness-logo/harness-logo"
import { toast } from "#library/toast/toast"
import { useCallback, useState } from "react"

interface ICopyChipProps {
	command: string
	label?: string
	harness?: THarness
}

export function CopyChip({ command, label, harness }: ICopyChipProps) {
	const [copied, setCopied] = useState(false)
	const [hovered, setHovered] = useState(false)

	const handleCopy = useCallback(() => {
		navigator.clipboard.writeText(command)
		toast.info(`Copied ${command} to clipboard`)
		setCopied(true)
		setTimeout(() => setCopied(false), 2000)
	}, [command])

	return (
		<button
			type="button"
			onClick={handleCopy}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			className="flex items-center gap-2 rounded-md px-2 py-1 cursor-pointer"
			style={{
				backgroundColor: hovered
					? "var(--muted)"
					: "color-mix(in oklab, var(--muted) 60%, transparent)",
				transition: "background-color 150ms",
			}}
			aria-label={label ? `Copy ${label} ${command}` : `Copy ${command}`}
		>
			{harness && (
				<HarnessLogo
					harness={harness}
					className="shrink-0 size-3.5 text-muted-foreground"
				/>
			)}
			{label && (
				<span className="text-xs text-muted-foreground">{label}</span>
			)}
			<code className="font-mono text-sm text-primary">{command}</code>
			{copied ? (
				<Check className="shrink-0 size-3 text-green-600" />
			) : (
				<Copy className="shrink-0 size-3 text-muted-foreground" />
			)}
		</button>
	)
}
