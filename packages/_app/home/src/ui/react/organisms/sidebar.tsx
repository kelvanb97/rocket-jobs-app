"use client"

import { Logo } from "@rja-design/ui/assets/logo"
import {
	Briefcase,
	Home,
	Plus,
	Settings,
	Sparkles,
} from "@rja-design/ui/assets/lucide"
import { cn } from "@rja-design/ui/cn"
import { TextBody } from "@rja-design/ui/library/text"
import { YStack } from "@rja-design/ui/primitives/y-stack"
import type { TPage } from "#templates/app-shell"
import Link from "next/link"

const HOME_NAV_ITEMS = [
	{ page: "dashboard" as const, href: "/", label: "Home", icon: Home },
]

const ROLES_NAV_ITEMS = [
	{ page: "roles" as const, href: "/roles", label: "Roles", icon: Briefcase },
	{
		page: "create" as const,
		href: "/create",
		label: "Create Role",
		icon: Plus,
	},
]

const SECONDARY_NAV_ITEMS = [
	{
		page: "llm-config" as const,
		href: "/llm-config",
		label: "LLM Config",
		icon: Sparkles,
	},
	{
		page: "settings" as const,
		href: "/settings",
		label: "Settings",
		icon: Settings,
	},
]

interface ISidebarProps {
	activePage: TPage
}

export function Sidebar({ activePage }: ISidebarProps) {
	return (
		<YStack className="h-full w-60 shrink-0 justify-between border-r border-sidebar-border bg-sidebar px-3 pb-4 pt-7">
			<YStack className="gap-6">
				<Logo />

				<YStack className="gap-3 px-1" role="navigation">
					<NavLinks items={HOME_NAV_ITEMS} activePage={activePage} />
					<div className="mx-2 h-px bg-sidebar-border" />
					<NavLinks items={ROLES_NAV_ITEMS} activePage={activePage} />
					<div className="mx-2 h-px bg-sidebar-border" />
					<NavLinks
						items={SECONDARY_NAV_ITEMS}
						activePage={activePage}
					/>
				</YStack>
			</YStack>

			<YStack className="gap-3 px-1">
				<a
					href="https://discord.com/invite/dfeB2Jxwhs"
					target="_blank"
					rel="noreferrer noopener"
					className="group flex items-center justify-center gap-2 rounded-lg bg-[#5865F2] px-3 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-[#4752C4]"
				>
					<DiscordIcon className="size-[18px]" />
					Join Discord
				</a>
				<div className="px-3">
					<div className="h-px w-full bg-sidebar-border" />
					<TextBody
						size="2xs"
						variant="muted-foreground"
						className="mt-3 text-center"
					>
						Rocket Jobs
					</TextBody>
				</div>
			</YStack>
		</YStack>
	)
}

function DiscordIcon({ className }: { className?: string }) {
	return (
		<svg
			className={className}
			viewBox="0 0 24 24"
			fill="currentColor"
			aria-hidden="true"
		>
			<path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.055c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
		</svg>
	)
}

interface INavLinksProps {
	items: ReadonlyArray<{
		page: TPage
		href: string
		label: string
		icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
	}>
	activePage: TPage
}

function NavLinks({ items, activePage }: INavLinksProps) {
	return (
		<YStack className="gap-0.5">
			{items.map(({ page, href, label, icon: Icon }) => {
				const isActive = activePage === page

				return (
					<Link
						key={href}
						href={href}
						className={cn(
							"group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-150",
							isActive
								? "bg-sidebar-primary/10 text-sidebar-primary font-medium"
								: "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
						)}
					>
						<Icon
							className={cn(
								"size-[18px] transition-colors duration-150",
								isActive
									? "text-sidebar-primary"
									: "text-muted-foreground group-hover:text-sidebar-accent-foreground",
							)}
							strokeWidth={isActive ? 2.2 : 1.8}
						/>
						{label}
					</Link>
				)
			})}
		</YStack>
	)
}
