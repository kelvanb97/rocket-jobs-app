"use client"

import { Download, X } from "@rja-design/ui/assets/lucide"
import { CopyChip } from "@rja-design/ui/library/copy-chip"
import { XStack } from "@rja-design/ui/primitives/x-stack"
import { YStack } from "@rja-design/ui/primitives/y-stack"
import { useEffect, useState } from "react"

interface IVersionOutdatedBannerClientProps {
	latestSha: string
}

const storageKey = (sha: string) => `rj-version-banner-dismissed-${sha}`

export function VersionOutdatedBannerClient({
	latestSha,
}: IVersionOutdatedBannerClientProps) {
	const [dismissed, setDismissed] = useState(true)

	useEffect(() => {
		try {
			const stored = window.sessionStorage.getItem(storageKey(latestSha))
			setDismissed(stored === "1")
		} catch {
			setDismissed(false)
		}
	}, [latestSha])

	const handleDismiss = () => {
		try {
			window.sessionStorage.setItem(storageKey(latestSha), "1")
		} catch {
			// sessionStorage unavailable — dismiss is best-effort
		}
		setDismissed(true)
	}

	if (dismissed) return null

	return (
		<YStack
			role="status"
			aria-live="polite"
			className="fixed bottom-4 right-4 z-50 max-w-sm gap-3 rounded-xl border border-border bg-background/95 p-4 shadow-lg backdrop-blur"
		>
			<XStack className="items-start justify-between gap-3">
				<XStack className="items-center gap-2">
					<Download className="size-4 text-primary" />
					<span className="text-sm font-medium">
						Update available
					</span>
				</XStack>
				<button
					type="button"
					onClick={handleDismiss}
					className="-m-1 inline-flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
					aria-label="Dismiss update banner"
				>
					<X className="size-3.5" />
				</button>
			</XStack>
			<span className="text-xs text-muted-foreground">
				Run the update skill in your AI assistant to pull the latest
				code, reinstall dependencies, and apply migrations.
			</span>
			<YStack className="gap-1">
				<CopyChip
					command="/rj-update"
					label="Claude Code"
					harness="claude-code"
				/>
				<CopyChip command="$rj-update" label="Codex" harness="codex" />
			</YStack>
		</YStack>
	)
}
