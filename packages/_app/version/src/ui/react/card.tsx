import { Check, Download } from "@rja-design/ui/assets/lucide"
import { CopyChip } from "@rja-design/ui/library/copy-chip"
import { XStack } from "@rja-design/ui/primitives/x-stack"
import { YStack } from "@rja-design/ui/primitives/y-stack"
import { getLatestSha, getLocalSha } from "#next/lib/check-app-version"

const GRADIENT = "linear-gradient(135deg, var(--primary), #a78bfa)"
const SUCCESS_GRADIENT = "linear-gradient(135deg, #10b981, #34d399)"

export async function VersionStatusCard() {
	const localSha = getLocalSha()
	const latest = await getLatestSha()

	if (!latest.ok) {
		return (
			<XStack className="items-start gap-4 rounded-xl border border-border bg-muted/40 p-5">
				<IconTile className="bg-muted">
					<Download className="size-5 text-muted-foreground" />
				</IconTile>
				<YStack className="flex-1 gap-1">
					<span className="text-base font-semibold">
						Unable to check for updates
					</span>
					<span className="text-xs text-muted-foreground">
						Couldn't reach GitHub to check the latest version. Try
						again in a bit.
					</span>
				</YStack>
			</XStack>
		)
	}

	const isUpToDate = localSha.length > 0 && latest.data === localSha

	if (isUpToDate) {
		return (
			<XStack
				className="items-start gap-4 rounded-xl p-5 shadow-lg"
				style={{ background: SUCCESS_GRADIENT }}
			>
				<IconTile className="bg-white/20 backdrop-blur">
					<Check className="size-5 text-white" />
				</IconTile>
				<YStack className="flex-1 gap-1">
					<span className="text-base font-semibold text-white">
						You&apos;re up to date
					</span>
					<span className="text-xs text-white/85">
						You&apos;re running the latest release of Rocket Jobs.
					</span>
				</YStack>
			</XStack>
		)
	}

	return (
		<XStack
			className="items-start gap-4 rounded-xl p-5 shadow-lg"
			style={{ background: GRADIENT }}
		>
			<IconTile className="bg-white/20 backdrop-blur">
				<Download className="size-5 text-white" />
			</IconTile>
			<YStack className="flex-1 gap-3">
				<YStack className="gap-1">
					<span className="text-base font-semibold text-white">
						Update available
					</span>
					<span className="text-xs text-white/85">
						A newer version of Rocket Jobs is available. Run the
						update skill in your AI assistant to pull the latest
						code, reinstall dependencies, and apply migrations.
					</span>
				</YStack>
				<YStack className="w-fit flex-wrap gap-2 rounded-lg bg-background/95 p-2 backdrop-blur">
					<CopyChip
						command="/rj-update"
						label="Claude Code"
						harness="claude-code"
					/>
					<CopyChip
						command="$rj-update"
						label="Codex"
						harness="codex"
					/>
				</YStack>
			</YStack>
		</XStack>
	)
}

function IconTile({
	className,
	children,
}: {
	className: string
	children: React.ReactNode
}) {
	return (
		<div
			className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${className}`}
		>
			{children}
		</div>
	)
}
