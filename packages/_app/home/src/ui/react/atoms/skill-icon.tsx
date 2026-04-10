import {
	FileText,
	Play,
	Search,
	Sparkles,
	User,
} from "@rja-design/ui/assets/lucide"
import type { LucideIcon } from "@rja-design/ui/assets/lucide"

const ICON_MAP: Record<string, LucideIcon> = {
	FileText,
	Play,
	Search,
	Sparkles,
	User,
}

export type TSkillIconName = keyof typeof ICON_MAP

export function getSkillIcon(name: string): LucideIcon {
	return ICON_MAP[name] ?? FileText
}
