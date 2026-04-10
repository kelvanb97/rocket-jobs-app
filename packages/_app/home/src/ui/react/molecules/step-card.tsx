"use client"

import { toast } from "@rja-design/ui/library/toast"
import { CopyChip } from "#atoms/copy-chip"
import { getSkillIcon } from "#atoms/skill-icon"
import { useCallback, useState } from "react"

const GRADIENT = "linear-gradient(135deg, var(--primary), #a78bfa)"

interface IStepCardProps {
	command: string
	title: string
	description: string
	iconName: string
	step: number
}

export function StepCard({
	command,
	title,
	description,
	iconName,
	step,
}: IStepCardProps) {
	const Icon = getSkillIcon(iconName)
	const [hovered, setHovered] = useState(false)
	const [copied, setCopied] = useState(false)

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
			className="flex flex-col items-start gap-3 rounded-xl border text-left select-none cursor-pointer p-4"
			style={{
				backgroundColor: hovered ? "var(--accent)" : "var(--card)",
				borderColor: hovered ? "var(--primary)" : undefined,
				boxShadow: hovered
					? "0 8px 24px color-mix(in oklab, var(--primary) 12%, transparent)"
					: "0 1px 2px rgba(0,0,0,0.04)",
				transform: hovered ? "translateY(-2px)" : "translateY(0)",
				transition: "all 150ms ease",
			}}
		>
			<div className="flex items-center gap-3 w-full">
				<div
					className="flex items-center justify-center shrink-0 size-6 rounded-full font-bold"
					style={{
						background: GRADIENT,
						fontSize: "0.6875rem",
						color: "white",
					}}
				>
					{step}
				</div>
				<Icon className="shrink-0 size-4 text-muted-foreground" />
				<span className="font-semibold text-sm text-foreground">
					{title}
				</span>
			</div>

			<div className="flex-1">
				<span
					className="text-sm text-muted-foreground"
					style={{ lineHeight: "1.5" }}
				>
					{description}
				</span>
			</div>

			<CopyChip command={command} copied={copied} hovered={hovered} />
		</button>
	)
}
