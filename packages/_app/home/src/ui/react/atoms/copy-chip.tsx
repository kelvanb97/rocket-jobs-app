import { Check, Copy } from "@rja-design/ui/assets/lucide"

interface ICopyChipProps {
	command: string
	copied: boolean
	hovered: boolean
}

export function CopyChip({ command, copied, hovered }: ICopyChipProps) {
	return (
		<div
			className="flex items-center gap-2 rounded-md px-2 py-1"
			style={{
				backgroundColor: hovered
					? "var(--muted)"
					: "color-mix(in oklab, var(--muted) 60%, transparent)",
				transition: "background-color 150ms",
			}}
		>
			{copied ? (
				<Check className="shrink-0 size-3 text-green-600" />
			) : (
				<Copy className="shrink-0 size-3 text-muted-foreground" />
			)}
			<code className="font-mono text-sm text-primary">{command}</code>
		</div>
	)
}
