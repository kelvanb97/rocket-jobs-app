"use client"

import { toast } from "@rja-design/ui/library/toast"
import { CopyChip } from "#atoms/copy-chip"
import { getSkillIcon } from "#atoms/skill-icon"
import { useCallback, useState } from "react"

const GRADIENT = "linear-gradient(135deg, var(--primary), #a78bfa)"

interface IWorkflowCardProps {
	command: string
	title: string
	description: string
	iconName: string
}

export function WorkflowCard({
	command,
	title,
	description,
	iconName,
}: IWorkflowCardProps) {
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
			className="relative flex flex-col items-start gap-4 p-6 rounded-xl border text-left select-none cursor-pointer"
			style={{
				backgroundColor: hovered ? "var(--accent)" : "var(--card)",
				borderColor: hovered
					? "var(--primary)"
					: "color-mix(in oklab, var(--border) 100%, transparent)",
				boxShadow: hovered
					? "0 8px 32px color-mix(in oklab, var(--primary) 15%, transparent), inset 0 1px 0 color-mix(in oklab, var(--primary) 10%, transparent)"
					: "0 1px 3px rgba(0,0,0,0.06)",
				transform: hovered ? "translateY(-2px)" : "translateY(0)",
				transition: "all 180ms ease",
			}}
		>
			<div
				className="absolute top-0 rounded-b-sm"
				style={{
					left: "1.5rem",
					right: "1.5rem",
					height: "2px",
					background: GRADIENT,
					opacity: hovered ? 1 : 0.5,
					transition: "opacity 180ms ease",
				}}
			/>

			<div className="flex items-center gap-3">
				<div
					className="flex items-center justify-center shrink-0 rounded-xl"
					style={{
						width: "2.75rem",
						height: "2.75rem",
						background:
							"linear-gradient(135deg, color-mix(in oklab, var(--primary) 15%, transparent), color-mix(in oklab, #a78bfa 10%, transparent))",
					}}
				>
					<Icon
						className="text-primary"
						style={{
							width: "1.375rem",
							height: "1.375rem",
						}}
					/>
				</div>
				<span
					className="font-semibold text-foreground"
					style={{ fontSize: "1.0625rem" }}
				>
					{title}
				</span>
			</div>

			<div className="flex-1">
				<span
					className="text-sm text-muted-foreground"
					style={{ lineHeight: "1.6" }}
				>
					{description}
				</span>
			</div>

			<CopyChip command={command} copied={copied} hovered={hovered} />
		</button>
	)
}
