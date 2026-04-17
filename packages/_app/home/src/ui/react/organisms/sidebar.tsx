"use client"

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
				<div className="px-4">
					<TextBody
						size="xl"
						variant="foreground"
						className="tracking-widest font-semibold"
					>
						Rocket Jobs
					</TextBody>
				</div>

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

			<div className="px-4">
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
