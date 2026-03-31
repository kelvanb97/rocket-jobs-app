"use client"

import { XStack } from "@rja-design/ui/primitives/x-stack"
import { YStack } from "@rja-design/ui/primitives/y-stack"
import { Sidebar } from "#organisms/sidebar"
import { TopBar } from "#organisms/top-bar"

export type TPage =
	| "dashboard"
	| "roles"
	| "people"
	| "follow-ups"
	| "create"
	| "operations"

interface IAppShellProps {
	activePage: TPage
	children: React.ReactNode
}

export function AppShell({ activePage, children }: IAppShellProps) {
	return (
		<XStack className="h-screen overflow-hidden">
			<Sidebar activePage={activePage} />
			<YStack className="flex-1 overflow-hidden">
				<TopBar activePage={activePage} />
				<main className="flex-1 overflow-y-auto p-6">{children}</main>
			</YStack>
		</XStack>
	)
}
