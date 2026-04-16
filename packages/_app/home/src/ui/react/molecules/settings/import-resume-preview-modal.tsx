"use client"

import type { TExtractedResume } from "@rja-api/settings/schema/extracted-resume-schema"
import type { TUserProfileFull } from "@rja-api/settings/schema/user-profile-schema"
import {
	useAction,
	useActionError,
	useIsLoading,
	useToastOnError,
} from "@rja-core/next-safe-action/hooks"
import { Button } from "@rja-design/ui/library/button"
import { Checkbox } from "@rja-design/ui/library/checkbox"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@rja-design/ui/library/dialog"
import { toast } from "@rja-design/ui/library/toast"
import { XStack } from "@rja-design/ui/primitives/x-stack"
import { YStack } from "@rja-design/ui/primitives/y-stack"
import { applyResumeImportAction } from "#actions/settings-actions"
import { useMemo, useState } from "react"

interface IImportResumePreviewModalProps {
	profile: TUserProfileFull | null
	extracted: TExtractedResume
	open: boolean
	onClose: () => void
	onApplied: (profile: TUserProfileFull) => void
}

type TProfileFieldKey =
	| "name"
	| "email"
	| "phone"
	| "location"
	| "links"
	| "jobTitle"
	| "seniority"
	| "yearsOfExperience"
	| "summary"
	| "skills"

const PROFILE_FIELD_LABELS: Record<TProfileFieldKey, string> = {
	name: "Name",
	email: "Email",
	phone: "Phone",
	location: "Location",
	links: "Links",
	jobTitle: "Job Title",
	seniority: "Seniority",
	yearsOfExperience: "Years of Experience",
	summary: "Summary",
	skills: "Skills",
}

const PROFILE_FIELD_ORDER: TProfileFieldKey[] = [
	"name",
	"email",
	"phone",
	"location",
	"links",
	"jobTitle",
	"seniority",
	"yearsOfExperience",
	"summary",
	"skills",
]

function formatValue(value: unknown): string {
	if (value === undefined || value === null) return ""
	if (Array.isArray(value)) return value.join(", ")
	return String(value)
}

function truncate(s: string, max = 60): string {
	if (s.length <= max) return s
	return `${s.slice(0, max - 1)}…`
}

export function ImportResumePreviewModal({
	profile,
	extracted,
	open,
	onClose,
	onApplied,
}: IImportResumePreviewModalProps) {
	// Profile fields: only show fields the LLM actually extracted (non-empty).
	const extractedProfileEntries = useMemo(() => {
		const entries: Array<{
			key: TProfileFieldKey
			label: string
			currentValue: string
			extractedValue: string
		}> = []
		const ep = extracted.profile ?? {}
		for (const key of PROFILE_FIELD_ORDER) {
			const raw = ep[key]
			if (raw === undefined || raw === null) continue
			if (typeof raw === "string" && raw.trim() === "") continue
			if (Array.isArray(raw) && raw.length === 0) continue
			entries.push({
				key,
				label: PROFILE_FIELD_LABELS[key],
				currentValue: profile ? formatValue(profile[key]) : "",
				extractedValue: formatValue(raw),
			})
		}
		return entries
	}, [extracted.profile, profile])

	const extractedExperience = extracted.workExperience ?? []
	const extractedEducation = extracted.education ?? []
	const extractedCertifications = extracted.certifications ?? []

	// Default everything checked.
	const [selectedProfileFields, setSelectedProfileFields] = useState<
		Set<TProfileFieldKey>
	>(() => new Set(extractedProfileEntries.map((e) => e.key)))
	const [selectedExperienceIndices, setSelectedExperienceIndices] = useState<
		Set<number>
	>(() => new Set(extractedExperience.map((_, i) => i)))
	const [selectedEducationIndices, setSelectedEducationIndices] = useState<
		Set<number>
	>(() => new Set(extractedEducation.map((_, i) => i)))
	const [selectedCertificationIndices, setSelectedCertificationIndices] =
		useState<Set<number>>(
			() => new Set(extractedCertifications.map((_, i) => i)),
		)

	const { execute, result, status } = useAction(applyResumeImportAction, {
		onSuccess: ({ data }) => {
			if (!data) return
			toast.success("Resume data applied!")
			onApplied(data)
		},
	})
	const error = useActionError(result)
	useToastOnError(error, status)
	const isLoading = useIsLoading(status)

	const toggleProfileField = (key: TProfileFieldKey) => {
		setSelectedProfileFields((prev) => {
			const next = new Set(prev)
			if (next.has(key)) next.delete(key)
			else next.add(key)
			return next
		})
	}
	const toggleExperience = (index: number) => {
		setSelectedExperienceIndices((prev) => {
			const next = new Set(prev)
			if (next.has(index)) next.delete(index)
			else next.add(index)
			return next
		})
	}
	const toggleEducation = (index: number) => {
		setSelectedEducationIndices((prev) => {
			const next = new Set(prev)
			if (next.has(index)) next.delete(index)
			else next.add(index)
			return next
		})
	}
	const toggleCertification = (index: number) => {
		setSelectedCertificationIndices((prev) => {
			const next = new Set(prev)
			if (next.has(index)) next.delete(index)
			else next.add(index)
			return next
		})
	}

	const handleApply = () => {
		const profileUpdates: Record<string, unknown> = {}
		for (const entry of extractedProfileEntries) {
			if (!selectedProfileFields.has(entry.key)) continue
			const raw = extracted.profile?.[entry.key]
			profileUpdates[entry.key] = raw
		}

		const workExperience = extractedExperience
			.filter((_, i) => selectedExperienceIndices.has(i))
			.map((exp) => ({
				company: exp.company,
				title: exp.title,
				startDate: exp.startDate,
				endDate: exp.endDate,
				type: exp.type ?? "full-time",
				summary: exp.summary ?? "",
				highlights: exp.highlights ?? [],
			}))

		const education = extractedEducation
			.filter((_, i) => selectedEducationIndices.has(i))
			.map((edu) => ({
				degree: edu.degree,
				field: edu.field,
				institution: edu.institution,
				gpa: edu.gpa ?? "",
			}))

		const certifications = extractedCertifications
			.filter((_, i) => selectedCertificationIndices.has(i))
			.map((cert) => ({
				name: cert.name,
				issuer: cert.issuer,
				issueDate: cert.issueDate ?? null,
				expirationDate: cert.expirationDate ?? null,
				url: cert.url ?? null,
			}))

		execute({
			profileUpdates,
			workExperience,
			education,
			certifications,
		})
	}

	const nothingSelected =
		selectedProfileFields.size === 0 &&
		selectedExperienceIndices.size === 0 &&
		selectedEducationIndices.size === 0 &&
		selectedCertificationIndices.size === 0

	return (
		<Dialog open={open} onOpenChange={(o) => !o && onClose()}>
			<DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto flex flex-col">
				<DialogHeader>
					<DialogTitle>Review extracted resume data</DialogTitle>
					<DialogDescription>
						Uncheck anything you don't want to apply. Selected items
						will be saved to your profile.
					</DialogDescription>
				</DialogHeader>

				<YStack className="gap-6">
					{/* Profile section */}
					{extractedProfileEntries.length > 0 && (
						<YStack className="gap-2">
							<h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
								Profile ({extractedProfileEntries.length}{" "}
								{extractedProfileEntries.length === 1
									? "field"
									: "fields"}
								)
							</h3>
							<YStack className="gap-2">
								{extractedProfileEntries.map((entry) => (
									<XStack
										key={entry.key}
										className="items-start gap-3 rounded-md border border-border p-3"
									>
										<Checkbox
											checked={selectedProfileFields.has(
												entry.key,
											)}
											onCheckedChange={() =>
												toggleProfileField(entry.key)
											}
										/>
										<YStack className="flex-1 gap-1">
											<span className="text-xs font-medium text-muted-foreground">
												{entry.label}
											</span>
											{entry.currentValue && (
												<span className="text-xs text-muted-foreground line-through">
													{truncate(
														entry.currentValue,
													)}
												</span>
											)}
											<span className="text-sm">
												{truncate(
													entry.extractedValue,
													200,
												)}
											</span>
										</YStack>
									</XStack>
								))}
							</YStack>
						</YStack>
					)}

					{/* Work Experience section */}
					{extractedExperience.length > 0 && (
						<YStack className="gap-2">
							<h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
								Work Experience ({extractedExperience.length})
							</h3>
							<YStack className="gap-2">
								{extractedExperience.map((exp, i) => (
									<XStack
										key={`exp-${i}`}
										className="items-start gap-3 rounded-md border border-border p-3"
									>
										<Checkbox
											checked={selectedExperienceIndices.has(
												i,
											)}
											onCheckedChange={() =>
												toggleExperience(i)
											}
										/>
										<YStack className="flex-1 gap-1">
											<span className="text-sm font-medium">
												{exp.title} @ {exp.company}
											</span>
											<span className="text-xs text-muted-foreground">
												{exp.startDate} – {exp.endDate}
												{exp.type
													? ` · ${exp.type}`
													: ""}
											</span>
											{exp.summary && (
												<span className="text-xs text-muted-foreground">
													{truncate(exp.summary, 160)}
												</span>
											)}
										</YStack>
									</XStack>
								))}
							</YStack>
						</YStack>
					)}

					{/* Education section */}
					{extractedEducation.length > 0 && (
						<YStack className="gap-2">
							<h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
								Education ({extractedEducation.length})
							</h3>
							<YStack className="gap-2">
								{extractedEducation.map((edu, i) => (
									<XStack
										key={`edu-${i}`}
										className="items-start gap-3 rounded-md border border-border p-3"
									>
										<Checkbox
											checked={selectedEducationIndices.has(
												i,
											)}
											onCheckedChange={() =>
												toggleEducation(i)
											}
										/>
										<YStack className="flex-1 gap-1">
											<span className="text-sm font-medium">
												{edu.degree} in {edu.field}
											</span>
											<span className="text-xs text-muted-foreground">
												{edu.institution}
											</span>
											{edu.gpa && (
												<span className="text-xs text-muted-foreground">
													GPA: {edu.gpa}
												</span>
											)}
										</YStack>
									</XStack>
								))}
							</YStack>
						</YStack>
					)}

					{/* Certifications section */}
					{extractedCertifications.length > 0 && (
						<YStack className="gap-2">
							<h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
								Certifications ({extractedCertifications.length}
								)
							</h3>
							<YStack className="gap-2">
								{extractedCertifications.map((cert, i) => (
									<XStack
										key={`cert-${i}`}
										className="items-start gap-3 rounded-md border border-border p-3"
									>
										<Checkbox
											checked={selectedCertificationIndices.has(
												i,
											)}
											onCheckedChange={() =>
												toggleCertification(i)
											}
										/>
										<YStack className="flex-1 gap-1">
											<span className="text-sm font-medium">
												{cert.name}
											</span>
											<span className="text-xs text-muted-foreground">
												{cert.issuer}
												{cert.issueDate &&
													` · ${cert.issueDate}`}
												{cert.expirationDate &&
													` – ${cert.expirationDate}`}
											</span>
										</YStack>
									</XStack>
								))}
							</YStack>
						</YStack>
					)}

					{extractedProfileEntries.length === 0 &&
						extractedExperience.length === 0 &&
						extractedEducation.length === 0 &&
						extractedCertifications.length === 0 && (
							<p className="text-sm text-muted-foreground">
								The resume parser didn't find any usable data.
								Try a different file.
							</p>
						)}
				</YStack>

				<DialogFooter>
					<Button
						variant="outline"
						onClick={onClose}
						disabled={isLoading}
					>
						Cancel
					</Button>
					<Button
						onClick={handleApply}
						disabled={isLoading || nothingSelected}
					>
						{isLoading ? "Applying..." : "Apply Selected"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
