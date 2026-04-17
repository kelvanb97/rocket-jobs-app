"use client"

import { CopyChip } from "@rja-design/ui/library/copy-chip"
import { getSkillIcon } from "#atoms/skill-icon"

const GRADIENT = "linear-gradient(135deg, var(--primary), #a78bfa)"

interface IWorkflowCardProps {
	skill: string
	title: string
	description: string
	iconName: string
}

export function WorkflowCard({
	skill,
	title,
	description,
	iconName,
}: IWorkflowCardProps) {
	const Icon = getSkillIcon(iconName)

	return (
		<div
			className="relative flex flex-col items-start gap-4 p-6 rounded-xl border text-left select-none"
			style={{
				backgroundColor: "var(--card)",
				borderColor:
					"color-mix(in oklab, var(--border) 100%, transparent)",
				boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
			}}
		>
			<div
				className="absolute top-0 rounded-b-sm"
				style={{
					left: "1.5rem",
					right: "1.5rem",
					height: "2px",
					background: GRADIENT,
					opacity: 0.5,
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
