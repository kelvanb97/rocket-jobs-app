"use client"

import { TextBody } from "@rja-design/ui/library/text"
import { XStack } from "@rja-design/ui/primitives/x-stack"
import type { TPage } from "#templates/app-shell"

const TITLE_MAP: Record<TPage, string> = {
	dashboard: "Home",
	roles: "Roles",
	create: "Create Role",
	settings: "Settings",
}

interface ITopBarProps {
	activePage: TPage
}

export function TopBar({ activePage }: ITopBarProps) {
	return (
		<XStack className="h-14 shrink-0 items-center border-b border-border bg-background px-6">
			<TextBody size="lg" variant="foreground">
				{TITLE_MAP[activePage]}
			</TextBody>
		</XStack>
	)
}
