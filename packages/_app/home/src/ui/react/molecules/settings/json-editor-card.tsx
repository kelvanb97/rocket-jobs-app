"use client"

import type { TEeoConfig } from "@rja-api/settings/schema/eeo-config-schema"
import type { TFormDefaults } from "@rja-api/settings/schema/form-defaults-schema"
import type { TScoringConfig } from "@rja-api/settings/schema/scoring-config-schema"
import type { TScraperConfig } from "@rja-api/settings/schema/scraper-config-schema"
import type { TUserProfileFull } from "@rja-api/settings/schema/user-profile-schema"
import {
	useAction,
	useActionError,
	useIsLoading,
	useToastOnError,
} from "@rja-core/next-safe-action/hooks"
import { cn } from "@rja-design/ui/cn"
import { Button } from "@rja-design/ui/library/button"
import { toast } from "@rja-design/ui/library/toast"
import { XStack } from "@rja-design/ui/primitives/x-stack"
import { YStack } from "@rja-design/ui/primitives/y-stack"
import { saveAllSettingsAction } from "#actions/settings-actions"
import {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface IJsonEditorCardProps {
	profile: TUserProfileFull
	eeo: TEeoConfig | null
	formDefaults: TFormDefaults | null
	scoring: TScoringConfig | null
	scraper: TScraperConfig | null
	onSaved: () => void
}

// ---------------------------------------------------------------------------
// JSON syntax highlighter
// ---------------------------------------------------------------------------

function highlightJson(json: string): string {
	return json.replace(
		/("(?:\\.|[^"\\])*")\s*(:)?|(\b(?:true|false|null)\b)|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|([{}[\],])/g,
		(match, str?: string, colon?: string, bool?: string, num?: string, punct?: string) => {
			if (str) {
				if (colon) {
					// key
					return `<span class="jse-key">${str}</span><span class="jse-punct">:</span>`
				}
				// string value
				return `<span class="jse-str">${str}</span>`
			}
			if (bool) return `<span class="jse-bool">${match}</span>`
			if (num) return `<span class="jse-num">${match}</span>`
			if (punct) return `<span class="jse-punct">${match}</span>`
			return match
		},
	)
}

// ---------------------------------------------------------------------------
// Build clean JSON from props
// ---------------------------------------------------------------------------

function buildJsonView(props: IJsonEditorCardProps) {
	const { profile, eeo, formDefaults, scoring, scraper } = props

	return {
		profile: {
			id: profile.id,
			name: profile.name,
			email: profile.email,
			phone: profile.phone,
			linkedin: profile.linkedin,
			github: profile.github,
			personalWebsite: profile.personalWebsite,
			location: profile.location,
			address: profile.address,
			jobTitle: profile.jobTitle,
			seniority: profile.seniority,
			yearsOfExperience: profile.yearsOfExperience,
			summary: profile.summary,
			notes: profile.notes,
			skills: profile.skills,
			preferredSkills: profile.preferredSkills,
			preferredLocationTypes: profile.preferredLocationTypes,
			preferredLocations: profile.preferredLocations,
			salaryMin: profile.salaryMin,
			salaryMax: profile.salaryMax,
			desiredSalary: profile.desiredSalary,
			startDateWeeksOut: profile.startDateWeeksOut,
			industries: profile.industries,
			dealbreakers: profile.dealbreakers,
			domainExpertise: profile.domainExpertise,
		},
		workExperience: profile.workExperience.map((exp) => ({
			company: exp.company,
			title: exp.title,
			startDate: exp.startDate,
			endDate: exp.endDate,
			type: exp.type,
			platforms: exp.platforms,
			techStack: exp.techStack,
			summary: exp.summary,
			highlights: exp.highlights,
		})),
		education: profile.education.map((edu) => ({
			degree: edu.degree,
			field: edu.field,
			institution: edu.institution,
		})),
		eeo: eeo
			? {
					gender: eeo.gender,
					ethnicity: eeo.ethnicity,
					veteranStatus: eeo.veteranStatus,
					disabilityStatus: eeo.disabilityStatus,
					workAuthorization: eeo.workAuthorization,
					requiresVisaSponsorship: eeo.requiresVisaSponsorship,
				}
			: null,
		formDefaults: formDefaults
			? {
					howDidYouHear: formDefaults.howDidYouHear,
					referredByEmployee: formDefaults.referredByEmployee,
					nonCompeteAgreement: formDefaults.nonCompeteAgreement,
					previouslyEmployed: formDefaults.previouslyEmployed,
					professionalReferences: formDefaults.professionalReferences,
					employmentType: formDefaults.employmentType,
				}
			: null,
		scoring: scoring
			? {
					titleAndSeniority: scoring.titleAndSeniority,
					skills: scoring.skills,
					salary: scoring.salary,
					location: scoring.location,
					industry: scoring.industry,
				}
			: null,
		scraper: scraper
			? {
					relevantKeywords: scraper.relevantKeywords,
					blockedKeywords: scraper.blockedKeywords,
					blockedCompanies: scraper.blockedCompanies,
					enabledSources: scraper.enabledSources,
					googleTitles: scraper.googleTitles,
					googleRemote: scraper.googleRemote,
					googleFullTimeOnly: scraper.googleFullTimeOnly,
					googleFreshnessDays: scraper.googleFreshnessDays,
					googleMaxPages: scraper.googleMaxPages,
					linkedinUrls: scraper.linkedinUrls,
					linkedinMaxPages: scraper.linkedinMaxPages,
					linkedinMaxPerPage: scraper.linkedinMaxPerPage,
				}
			: null,
	}
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function JsonEditorCard(props: IJsonEditorCardProps) {
	const { onSaved } = props
	const initialJson = useMemo(
		() => JSON.stringify(buildJsonView(props), null, "\t"),
		[props],
	)
	const [value, setValue] = useState(initialJson)
	const [parseError, setParseError] = useState<string | null>(null)
	const [activeLine, setActiveLine] = useState(0)
	const isValidJson = parseError === null

	const textareaRef = useRef<HTMLTextAreaElement>(null)
	const highlightRef = useRef<HTMLPreElement>(null)
	const lineNumbersRef = useRef<HTMLDivElement>(null)

	const lines = useMemo(() => value.split("\n"), [value])
	const highlightedLines = useMemo(
		() => lines.map((line) => highlightJson(line)),
		[lines],
	)

	// Validate JSON on change
	useEffect(() => {
		try {
			JSON.parse(value)
			setParseError(null)
		} catch (e) {
			setParseError(e instanceof Error ? e.message : "Invalid JSON")
		}
	}, [value])

	// Track active line from cursor position
	const updateActiveLine = useCallback(() => {
		const ta = textareaRef.current
		if (!ta) return
		const before = ta.value.slice(0, ta.selectionStart)
		setActiveLine(before.split("\n").length - 1)
	}, [])

	// Sync scroll across all three layers
	const syncScroll = useCallback(() => {
		const ta = textareaRef.current
		if (!ta) return
		if (highlightRef.current) {
			highlightRef.current.scrollTop = ta.scrollTop
			highlightRef.current.scrollLeft = ta.scrollLeft
		}
		if (lineNumbersRef.current) {
			lineNumbersRef.current.scrollTop = ta.scrollTop
		}
	}, [])

	const { execute, result, status } = useAction(saveAllSettingsAction, {
		onSuccess: () => {
			toast.success("All settings saved!")
			onSaved()
		},
	})
	const error = useActionError(result)
	useToastOnError(error, status)
	const isLoading = useIsLoading(status)

	const handleSave = () => {
		if (!isValidJson) return
		execute({ json: value })
	}

	const handleReset = () => {
		setValue(initialJson)
		setParseError(null)
	}

	return (
		<>
			{/* Theme styles */}
			<style
				dangerouslySetInnerHTML={{
					__html: `
						.jse-key { color: #9cdcfe; }
						.jse-str { color: #ce9178; }
						.jse-num { color: #b5cea8; }
						.jse-bool { color: #569cd6; }
						.jse-punct { color: #808080; }
						.jse-textarea { scrollbar-width: none; }
						.jse-textarea::-webkit-scrollbar { display: none; }
					`,
				}}
			/>

			<YStack className="h-full gap-0">
				{/* Toolbar */}
				<XStack className="shrink-0 items-center justify-between pb-3">
					<YStack className="gap-0.5">
						<span className="text-sm font-medium">JSON Editor</span>
						<span className="text-xs text-muted-foreground">
							View and edit all settings as JSON. Changes here
							overwrite all sections.
						</span>
					</YStack>
					<XStack className="gap-2">
						<Button
							size="sm"
							variant="outline"
							onClick={handleReset}
						>
							Reset
						</Button>
						<Button
							size="sm"
							onClick={handleSave}
							disabled={isLoading || !isValidJson}
						>
							{isLoading ? "Saving..." : "Save All"}
						</Button>
					</XStack>
				</XStack>

				{/* Editor */}
				<div
					className={cn(
						"relative flex flex-1 rounded-t-lg border",
						parseError ? "border-destructive" : "border-border",
					)}
					style={{ background: "#1e1e1e", overflow: "hidden" }}
				>
					{/* Line numbers gutter */}
					<div
						ref={lineNumbersRef}
						aria-hidden
						className="shrink-0 select-none"
						style={{
							background: "#1e1e1e",
							borderRight: "1px solid #2d2d2d",
							overflow: "hidden",
						}}
					>
						{lines.map((_, i) => (
							<div
								key={i}
								className="px-3 text-right font-mono"
								style={{
									fontSize: "12px",
									lineHeight: 1.625,
									color:
										i === activeLine
											? "#c6c6c6"
											: "#555555",
									background:
										i === activeLine
											? "rgba(255, 255, 255, 0.06)"
											: "transparent",
									...(i === 0
										? { paddingTop: "12px" }
										: {}),
									...(i === lines.length - 1
										? { paddingBottom: "12px" }
										: {}),
								}}
							>
								{i + 1}
							</div>
						))}
					</div>

					{/* Code area: highlight layer + textarea */}
					<div className="relative flex-1" style={{ overflow: "hidden" }}>
						{/* Syntax-highlighted overlay with per-line active highlight */}
						<pre
							ref={highlightRef}
							aria-hidden
							className="pointer-events-none absolute inset-0 font-mono"
						style={{
							margin: 0,
							padding: 0,
							tabSize: 4,
							overflow: "hidden",
						}}
					>
							{highlightedLines.map((html, i) => (
								<div
									key={i}
									style={{
										padding: "0 12px",
										fontSize: "12px",
										lineHeight: 1.625,
										whiteSpace: "pre",
										color: "#d4d4d4",
										...(i === activeLine
											? {
													background:
														"rgba(255, 255, 255, 0.06)",
													borderLeft:
														"2px solid #c6c6c6",
													paddingLeft: "10px",
												}
											: {
													borderLeft:
														"2px solid transparent",
													paddingLeft: "10px",
												}),
										...(i === 0
											? { paddingTop: "12px" }
											: {}),
										...(i === highlightedLines.length - 1
											? { paddingBottom: "12px" }
											: {}),
									}}
									dangerouslySetInnerHTML={{
										__html: html || " ",
									}}
								/>
							))}
						</pre>

						{/* Invisible textarea for input */}
						<textarea
							ref={textareaRef}
							value={value}
							onChange={(e) => setValue(e.target.value)}
							onScroll={syncScroll}
							onKeyUp={updateActiveLine}
							onMouseUp={updateActiveLine}
							onFocus={updateActiveLine}
							spellCheck={false}
							className="jse-textarea relative block h-full w-full resize-none font-mono outline-none"
							style={{
								fontSize: "12px",
								lineHeight: 1.625,
								padding: "12px",
								paddingLeft: "12px",
								color: "transparent",
								caretColor: "#aeafad",
								background: "transparent",
								tabSize: 4,
								whiteSpace: "pre",
								overflowWrap: "normal",
							}}
						/>
					</div>
				</div>

				{/* Status bar */}
				<XStack
					className="shrink-0 items-center justify-between rounded-b-lg px-3 py-1 font-mono"
					style={{
						fontSize: "11px",
						background: parseError ? "#5a1d1d" : "#007acc",
						color: "#ffffff",
					}}
				>
					<span>{parseError ?? "Valid JSON"}</span>
					<XStack className="gap-4">
						<span>
							Ln {activeLine + 1}
						</span>
						<span>{lines.length} lines</span>
					</XStack>
				</XStack>
			</YStack>
		</>
	)
}
