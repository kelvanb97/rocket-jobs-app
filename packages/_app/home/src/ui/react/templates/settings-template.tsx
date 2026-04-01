"use client"

import type { TEeoConfig } from "@rja-api/settings/schema/eeo-config-schema"
import type { TFormDefaults } from "@rja-api/settings/schema/form-defaults-schema"
import type { TScoringConfig } from "@rja-api/settings/schema/scoring-config-schema"
import type { TScraperConfig } from "@rja-api/settings/schema/scraper-config-schema"
import type { TUserProfileFull } from "@rja-api/settings/schema/user-profile-schema"
import {
	BarChart3,
	Braces,
	Briefcase,
	FileText,
	Globe,
	GraduationCap,
	Linkedin,
	Search,
	Shield,
	User,
	type LucideIcon,
} from "@rja-design/ui/assets/lucide"
import { cn } from "@rja-design/ui/cn"
import { XStack } from "@rja-design/ui/primitives/x-stack"
import { YStack } from "@rja-design/ui/primitives/y-stack"
import { EducationCard } from "#molecules/settings/education-card"
import { EeoCard } from "#molecules/settings/eeo-card"
import { FormDefaultsCard } from "#molecules/settings/form-defaults-card"
import { GoogleJobsCard } from "#molecules/settings/google-jobs-card"
import { JsonEditorCard } from "#molecules/settings/json-editor-card"
import { LinkedInCard } from "#molecules/settings/linkedin-card"
import { ProfileCard } from "#molecules/settings/profile-card"
import { ScoringWeightsCard } from "#molecules/settings/scoring-weights-card"
import { ScraperConfigCard } from "#molecules/settings/scraper-config-card"
import { WorkExperienceCard } from "#molecules/settings/work-experience-card"
import { useRouter } from "next/navigation"
import { useCallback, useState } from "react"

type TTab = {
	key: string
	label: string
	icon: LucideIcon
}

type TSection = {
	label: string
	tabs: TTab[]
}

const SECTIONS: TSection[] = [
	{
		label: "Profile",
		tabs: [
			{ key: "profile", label: "Profile", icon: User },
			{ key: "work-experience", label: "Experience", icon: Briefcase },
			{ key: "education", label: "Education", icon: GraduationCap },
		],
	},
	{
		label: "Application",
		tabs: [
			{ key: "eeo", label: "EEO & Work Auth", icon: Shield },
			{ key: "form-defaults", label: "Form Defaults", icon: FileText },
			{ key: "scoring", label: "Scoring Weights", icon: BarChart3 },
		],
	},
	{
		label: "Scraper",
		tabs: [
			{ key: "scraper", label: "Scraper Config", icon: Search },
			{ key: "google-jobs", label: "Google Jobs", icon: Globe },
			{ key: "linkedin", label: "LinkedIn", icon: Linkedin },
		],
	},
	{
		label: "Advanced",
		tabs: [{ key: "json", label: "JSON Editor", icon: Braces }],
	},
]

type TTabKey = string

interface ISettingsTemplateProps {
	profile: TUserProfileFull | null
	eeo: TEeoConfig | null
	formDefaults: TFormDefaults | null
	scoring: TScoringConfig | null
	scraper: TScraperConfig | null
}

export function SettingsTemplate({
	profile,
	eeo,
	formDefaults,
	scoring,
	scraper,
}: ISettingsTemplateProps) {
	const [activeTab, setActiveTab] = useState<TTabKey>("profile")
	const router = useRouter()
	const onSaved = useCallback(() => router.refresh(), [router])

	const hasProfile = !!profile

	return (
		<XStack className="h-full gap-0">
			<YStack className="w-48 shrink-0 border-r border-border pr-2 pt-1">
				{SECTIONS.map((section, sectionIdx) => (
					<div key={section.label}>
						{sectionIdx > 0 && (
							<div className="mx-2 my-1.5 h-px bg-border" />
						)}
						<div className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
							{section.label}
						</div>
						{section.tabs.map((tab) => {
							const Icon = tab.icon
							const isActive = activeTab === tab.key
							const isDisabled =
								!hasProfile && tab.key !== "profile"
							return (
								<button
									key={tab.key}
									type="button"
									disabled={isDisabled}
									onClick={() => setActiveTab(tab.key)}
									className={cn(
										"flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-150 w-full text-left",
										isActive
											? "bg-primary/10 text-primary font-medium"
											: "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
										isDisabled &&
											"opacity-40 cursor-not-allowed hover:bg-transparent hover:text-muted-foreground",
									)}
								>
									<Icon
										className={cn(
											"size-4 shrink-0",
											isActive
												? "text-primary"
												: "text-muted-foreground",
										)}
										strokeWidth={isActive ? 2.2 : 1.8}
									/>
									{tab.label}
								</button>
							)
						})}
					</div>
				))}
			</YStack>

			<div className="flex-1 overflow-y-auto pl-6 pb-6">
				{activeTab === "profile" && (
					<ProfileCard profile={profile} onSaved={onSaved} />
				)}
				{activeTab === "work-experience" && profile && (
					<WorkExperienceCard
						profileId={profile.id}
						workExperience={profile.workExperience}
						onSaved={onSaved}
					/>
				)}
				{activeTab === "education" && profile && (
					<EducationCard
						profileId={profile.id}
						education={profile.education}
						onSaved={onSaved}
					/>
				)}
				{activeTab === "eeo" && profile && (
					<EeoCard
						profileId={profile.id}
						eeo={eeo}
						onSaved={onSaved}
					/>
				)}
				{activeTab === "form-defaults" && profile && (
					<FormDefaultsCard
						profileId={profile.id}
						formDefaults={formDefaults}
						onSaved={onSaved}
					/>
				)}
				{activeTab === "scoring" && profile && (
					<ScoringWeightsCard
						profileId={profile.id}
						scoring={scoring}
						onSaved={onSaved}
					/>
				)}
				{activeTab === "scraper" && profile && (
					<ScraperConfigCard
						profileId={profile.id}
						scraper={scraper}
						onSaved={onSaved}
					/>
				)}
				{activeTab === "google-jobs" && profile && (
					<GoogleJobsCard
						profileId={profile.id}
						scraper={scraper}
						onSaved={onSaved}
					/>
				)}
				{activeTab === "linkedin" && profile && (
					<LinkedInCard
						profileId={profile.id}
						scraper={scraper}
						onSaved={onSaved}
					/>
				)}
				{activeTab === "json" && profile && (
					<JsonEditorCard
						profile={profile}
						eeo={eeo}
						formDefaults={formDefaults}
						scoring={scoring}
						scraper={scraper}
						onSaved={onSaved}
					/>
				)}
			</div>
		</XStack>
	)
}
