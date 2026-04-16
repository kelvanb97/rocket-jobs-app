"use client"

import type { TEeoConfig } from "@rja-api/settings/schema/eeo-config-schema"
import type { TFormDefaults } from "@rja-api/settings/schema/form-defaults-schema"
import type { TLlmConfig } from "@rja-api/settings/schema/llm-config-schema"
import type { TScoringConfig } from "@rja-api/settings/schema/scoring-config-schema"
import type { TScraperConfig } from "@rja-api/settings/schema/scraper-config-schema"
import type {
	TCertification,
	TEducation,
	TLocationType,
	TUserProfile,
	TUserProfileFull,
	TWorkExperience,
} from "@rja-api/settings/schema/user-profile-schema"
import {
	Award,
	BarChart3,
	Braces,
	Briefcase,
	FileText,
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
import { CertificationCard } from "#molecules/settings/certification-card"
import { EducationCard } from "#molecules/settings/education-card"
import { EeoCard } from "#molecules/settings/eeo-card"
import { FormDefaultsCard } from "#molecules/settings/form-defaults-card"
import { ImportFromResumeBar } from "#molecules/settings/import-from-resume-bar"
import { JsonEditorCard } from "#molecules/settings/json-editor-card"
import { LinkedInCard } from "#molecules/settings/linkedin-card"
import { LlmMissingBanner } from "#molecules/settings/llm-missing-banner"
import { ProfileCard } from "#molecules/settings/profile-card"
import { ScoringWeightsCard } from "#molecules/settings/scoring-weights-card"
import { ScraperConfigCard } from "#molecules/settings/scraper-config-card"
import { WorkExperienceCard } from "#molecules/settings/work-experience-card"
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
			{ key: "certifications", label: "Certifications", icon: Award },
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
	initialProfile: TUserProfileFull | null
	initialEeo: TEeoConfig | null
	initialFormDefaults: TFormDefaults | null
	initialScoring: TScoringConfig | null
	initialScraper: TScraperConfig | null
	llm: TLlmConfig | null
}

export function SettingsTemplate({
	initialProfile,
	initialEeo,
	initialFormDefaults,
	initialScoring,
	initialScraper,
	llm,
}: ISettingsTemplateProps) {
	const [activeTab, setActiveTab] = useState<TTabKey>("profile")
	const [profile, setProfile] = useState(initialProfile)
	const [eeo, setEeo] = useState(initialEeo)
	const [formDefaults, setFormDefaults] = useState(initialFormDefaults)
	const [scoring, setScoring] = useState(initialScoring)
	const [scraper, setScraper] = useState(initialScraper)

	const onProfileSaved = useCallback((data: TUserProfile) => {
		setProfile((prev) =>
			prev
				? {
						...prev,
						...data,
						preferredLocationTypes:
							data.preferredLocationTypes as TLocationType[],
					}
				: null,
		)
	}, [])

	const onImported = useCallback((freshProfile: TUserProfileFull) => {
		setProfile(freshProfile)
	}, [])

	const onWorkExperienceChanged = useCallback(
		(entries: TWorkExperience[]) => {
			setProfile((prev) =>
				prev ? { ...prev, workExperience: entries } : null,
			)
		},
		[],
	)

	const onEducationChanged = useCallback((entries: TEducation[]) => {
		setProfile((prev) => (prev ? { ...prev, education: entries } : null))
	}, [])

	const onCertificationsChanged = useCallback((entries: TCertification[]) => {
		setProfile((prev) =>
			prev ? { ...prev, certifications: entries } : null,
		)
	}, [])

	const onEeoSaved = useCallback((data: TEeoConfig) => setEeo(data), [])
	const onFormDefaultsSaved = useCallback(
		(data: TFormDefaults) => setFormDefaults(data),
		[],
	)
	const onScoringSaved = useCallback(
		(data: TScoringConfig) => setScoring(data),
		[],
	)
	const onScraperSaved = useCallback(
		(data: TScraperConfig) => setScraper(data),
		[],
	)

	const llmConfigured = !!(llm?.anthropicApiKey || llm?.openaiApiKey)

	return (
		<YStack className="h-full gap-0 overflow-hidden">
			{llmConfigured ? (
				<ImportFromResumeBar
					profile={profile}
					onImported={onImported}
				/>
			) : (
				<LlmMissingBanner />
			)}
			<XStack className="flex-1 min-h-0 gap-0">
				<YStack className="w-48 shrink-0 overflow-y-auto border-r border-border pr-2 pt-1">
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
								return (
									<button
										key={tab.key}
										type="button"
										onClick={() => setActiveTab(tab.key)}
										className={cn(
											"flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-150 w-full text-left",
											isActive
												? "bg-primary/10 text-primary font-medium"
												: "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
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

				<div className="flex-1 overflow-y-auto p-6">
					{activeTab === "profile" && (
						<ProfileCard
							profile={profile}
							onSaved={onProfileSaved}
						/>
					)}
					{activeTab === "work-experience" &&
						(profile ? (
							<WorkExperienceCard
								profileId={profile.id}
								workExperience={profile.workExperience}
								onChanged={onWorkExperienceChanged}
							/>
						) : (
							<NeedsProfile tab="Experience" />
						))}
					{activeTab === "education" &&
						(profile ? (
							<EducationCard
								profileId={profile.id}
								education={profile.education}
								onChanged={onEducationChanged}
							/>
						) : (
							<NeedsProfile tab="Education" />
						))}
					{activeTab === "certifications" &&
						(profile ? (
							<CertificationCard
								profileId={profile.id}
								certifications={profile.certifications}
								onChanged={onCertificationsChanged}
							/>
						) : (
							<NeedsProfile tab="Certifications" />
						))}
					{activeTab === "eeo" &&
						(profile ? (
							<EeoCard
								profileId={profile.id}
								eeo={eeo}
								onSaved={onEeoSaved}
							/>
						) : (
							<NeedsProfile tab="EEO & Work Auth" />
						))}
					{activeTab === "form-defaults" &&
						(profile ? (
							<FormDefaultsCard
								profileId={profile.id}
								formDefaults={formDefaults}
								onSaved={onFormDefaultsSaved}
							/>
						) : (
							<NeedsProfile tab="Form Defaults" />
						))}
					{activeTab === "scoring" &&
						(profile ? (
							<ScoringWeightsCard
								profileId={profile.id}
								scoring={scoring}
								onSaved={onScoringSaved}
							/>
						) : (
							<NeedsProfile tab="Scoring Weights" />
						))}
					{activeTab === "scraper" &&
						(profile ? (
							<ScraperConfigCard
								profileId={profile.id}
								scraper={scraper}
								onSaved={onScraperSaved}
							/>
						) : (
							<NeedsProfile tab="Scraper Config" />
						))}
					{activeTab === "linkedin" &&
						(profile ? (
							<LinkedInCard
								profileId={profile.id}
								scraper={scraper}
								onSaved={onScraperSaved}
							/>
						) : (
							<NeedsProfile tab="LinkedIn" />
						))}
					{activeTab === "json" && (
						<JsonEditorCard
							profile={profile}
							eeo={eeo}
							formDefaults={formDefaults}
							scoring={scoring}
							scraper={scraper}
						/>
					)}
				</div>
			</XStack>
		</YStack>
	)
}

function NeedsProfile({ tab }: { tab: string }) {
	return (
		<YStack className="gap-2 rounded-md border border-dashed border-border p-6">
			<span className="text-sm font-medium">No profile yet</span>
			<span className="text-sm text-muted-foreground">
				Create your profile first — fill in the Profile tab by hand or
				upload a resume at the top of this page to auto-populate it.
				Once a profile exists, {tab} will be editable here.
			</span>
		</YStack>
	)
}
