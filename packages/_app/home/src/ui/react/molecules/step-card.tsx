"use client"

import { CopyChip } from "#atoms/copy-chip"
import { getSkillIcon } from "#atoms/skill-icon"

const GRADIENT = "linear-gradient(135deg, var(--primary), #a78bfa)"

interface IStepCardProps {
	skill: string
	title: string
	description: string
	iconName: string
	step: number
}

export function StepCard({
	skill,
	title,
	description,
	iconName,
	step,
}: IStepCardProps) {
	const Icon = getSkillIcon(iconName)

	return (
		<div
			className="flex flex-col items-start gap-3 rounded-xl border text-left select-none p-4"
			style={{
				backgroundColor: "var(--card)",
				boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
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

			<div className="flex flex-wrap gap-2">
				<CopyChip
					command={`/${skill}`}
					label="Claude Code"
					harness="claude-code"
				/>
				<CopyChip command={`$${skill}`} label="Codex" harness="codex" />
			</div>
		</div>
	)
}
