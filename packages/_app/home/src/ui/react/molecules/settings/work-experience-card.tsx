"use client"

import type { TWorkExperienceType } from "@rja-api/settings/schema/user-profile-schema"
import {
	useAction,
	useActionError,
	useIsLoading,
	useToastOnError,
} from "@rja-core/next-safe-action/hooks"
import { Pencil, Plus, Trash2 } from "@rja-design/ui/assets/lucide"
import { Badge } from "@rja-design/ui/library/badge"
import { Button } from "@rja-design/ui/library/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@rja-design/ui/library/card"
import { Checkbox } from "@rja-design/ui/library/checkbox"
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@rja-design/ui/library/dialog"
import { Input } from "@rja-design/ui/library/input"
import { InputLabelWrapper } from "@rja-design/ui/library/input-label-wrapper"
import { Label } from "@rja-design/ui/library/label"
import { MonthYearPicker } from "@rja-design/ui/library/month-year-picker"
import { MultiInput } from "@rja-design/ui/library/multi-input"
import { Select } from "@rja-design/ui/library/select"
import { Textarea } from "@rja-design/ui/library/text-area"
import { toast } from "@rja-design/ui/library/toast"
import { XStack } from "@rja-design/ui/primitives/x-stack"
import { YStack } from "@rja-design/ui/primitives/y-stack"
import {
	deleteWorkExperienceAction,
	upsertWorkExperienceAction,
} from "#actions/settings-actions"
import { useState } from "react"

interface IWorkExperienceEntry {
	id: number
	userProfileId: number
	sortOrder: number
	company: string
	title: string
	startDate: string
	endDate: string
	type: string
	summary: string
	highlights: string[]
	createdAt: Date | null
	updatedAt: Date | null
}

interface IWorkExperienceCardProps {
	profileId: number
	workExperience: IWorkExperienceEntry[]
	onChanged: (entries: IWorkExperienceEntry[]) => void
}

const TYPE_OPTIONS = [
	{ label: "Full-time", value: "full-time" },
	{ label: "Contract", value: "contract" },
	{ label: "Founder", value: "founder" },
	{ label: "Self-employed", value: "self-employed" },
]

const CURRENT = "Current"

function isCurrent(value: string): boolean {
	const v = value.trim().toLowerCase()
	return v === "current" || v === "present"
}

const EMPTY_FORM = {
	company: "",
	title: "",
	startDate: "",
	endDate: "",
	type: "",
	summary: "",
	highlights: [] as string[],
}

export function WorkExperienceCard({
	profileId,
	workExperience,
	onChanged,
}: IWorkExperienceCardProps) {
	const [entries, setEntries] =
		useState<IWorkExperienceEntry[]>(workExperience)
	const [dialogOpen, setDialogOpen] = useState(false)
	const [editingEntry, setEditingEntry] =
		useState<IWorkExperienceEntry | null>(null)
	const [form, setForm] = useState(EMPTY_FORM)

	const openAddDialog = () => {
		setEditingEntry(null)
		setForm(EMPTY_FORM)
		setDialogOpen(true)
	}

	const openEditDialog = (entry: IWorkExperienceEntry) => {
		setEditingEntry(entry)
		setForm({
			company: entry.company,
			title: entry.title,
			startDate: entry.startDate,
			endDate: entry.endDate,
			type: entry.type,
			summary: entry.summary,
			highlights: entry.highlights,
		})
		setDialogOpen(true)
	}

	const closeDialog = () => {
		setDialogOpen(false)
		setEditingEntry(null)
		setForm(EMPTY_FORM)
	}

	const {
		execute: executeSave,
		result: saveResult,
		status: saveStatus,
	} = useAction(upsertWorkExperienceAction, {
		onSuccess: ({ data }) => {
			if (data) {
				toast.success("Work experience saved!")
				setEntries((prev) => {
					const next = prev.some((e) => e.id === data.id)
						? prev.map((e) => (e.id === data.id ? data : e))
						: [...prev, data]
					onChanged(next)
					return next
				})
				closeDialog()
			}
		},
	})

	const saveError = useActionError(saveResult)
	useToastOnError(saveError, saveStatus)
	const isSaving = useIsLoading(saveStatus)

	const {
		execute: executeDelete,
		result: deleteResult,
		status: deleteStatus,
	} = useAction(deleteWorkExperienceAction, {
		onSuccess: ({ data }) => {
			if (data) {
				toast.success("Work experience deleted!")
				setEntries((prev) => {
					const next = prev.filter((e) => e.id !== data.id)
					onChanged(next)
					return next
				})
			}
		},
	})

	const deleteError = useActionError(deleteResult)
	useToastOnError(deleteError, deleteStatus)
	const isDeleting = useIsLoading(deleteStatus)

	const [deletingId, setDeletingId] = useState<number | null>(null)

	const handleDelete = (id: number) => {
		setDeletingId(id)
		executeDelete({ id })
	}

	const handleSave = () => {
		executeSave({
			...(editingEntry ? { id: editingEntry.id } : {}),
			userProfileId: profileId,
			sortOrder: editingEntry ? editingEntry.sortOrder : entries.length,
			company: form.company,
			title: form.title,
			startDate: form.startDate,
			endDate: form.endDate,
			type: form.type as TWorkExperienceType,
			summary: form.summary,
			highlights: form.highlights,
		})
	}

	const updateField = <K extends keyof typeof EMPTY_FORM>(
		field: K,
		value: (typeof EMPTY_FORM)[K],
	) => {
		setForm((prev) => ({ ...prev, [field]: value }))
	}

	return (
		<>
			<Card>
				<CardHeader>
					<CardTitle>Work Experience</CardTitle>
					<CardDescription>
						Manage your work history entries.
					</CardDescription>
				</CardHeader>
				<CardContent>
					{entries.length === 0 ? (
						<p className="text-sm text-muted-foreground py-4 text-center">
							No work experience entries yet.
						</p>
					) : (
						<YStack className="gap-3">
							{entries.map((entry) => (
								<div
									key={entry.id}
									className="flex items-center justify-between rounded-lg border p-3"
								>
									<YStack className="gap-1">
										<XStack className="items-center gap-2">
											<span className="font-medium text-sm">
												{entry.company}
											</span>
											<span className="text-muted-foreground text-sm">
												{entry.title}
											</span>
										</XStack>
										<XStack className="items-center gap-2">
											<span className="text-xs text-muted-foreground">
												{entry.startDate} &ndash;{" "}
												{entry.endDate}
											</span>
											<Badge variant="secondary">
												{entry.type}
											</Badge>
										</XStack>
									</YStack>
									<XStack className="gap-1">
										<Button
											variant="ghost"
											size="icon"
											onClick={() =>
												openEditDialog(entry)
											}
										>
											<Pencil className="size-4" />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											onClick={() =>
												handleDelete(entry.id)
											}
											disabled={
												isDeleting &&
												deletingId === entry.id
											}
										>
											<Trash2 className="size-4 text-destructive" />
										</Button>
									</XStack>
								</div>
							))}
						</YStack>
					)}
				</CardContent>
				<CardFooter>
					<Button variant="outline" onClick={openAddDialog}>
						<Plus className="size-4 mr-1" />
						Add Experience
					</Button>
				</CardFooter>
			</Card>

			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>
							{editingEntry
								? "Edit Experience"
								: "Add Experience"}
						</DialogTitle>
					</DialogHeader>
					<div>
						<YStack className="gap-4">
							<XStack className="gap-4">
								<InputLabelWrapper className="flex-1">
									<Label
										htmlFor="we-company"
										showRequiredIcon
									>
										Company
									</Label>
									<Input
										id="we-company"
										value={form.company}
										onChange={(e) =>
											updateField(
												"company",
												e.target.value,
											)
										}
										placeholder="Acme Corp"
									/>
								</InputLabelWrapper>
								<InputLabelWrapper className="flex-1">
									<Label htmlFor="we-title" showRequiredIcon>
										Title
									</Label>
									<Input
										id="we-title"
										value={form.title}
										onChange={(e) =>
											updateField("title", e.target.value)
										}
										placeholder="Senior Software Engineer"
									/>
								</InputLabelWrapper>
							</XStack>

							<XStack className="gap-4 items-start">
								<InputLabelWrapper className="flex-1">
									<Label showRequiredIcon>Start Date</Label>
									<MonthYearPicker
										value={form.startDate}
										onChange={(val) =>
											updateField("startDate", val)
										}
									/>
								</InputLabelWrapper>
								<InputLabelWrapper className="flex-1">
									<XStack className="items-center justify-between">
										<Label showRequiredIcon>End Date</Label>
										<XStack className="items-center gap-1.5">
											<Checkbox
												id="we-end-current"
												checked={isCurrent(
													form.endDate,
												)}
												onCheckedChange={(checked) =>
													updateField(
														"endDate",
														checked ? CURRENT : "",
													)
												}
											/>
											<Label
												htmlFor="we-end-current"
												className="text-xs font-normal text-muted-foreground cursor-pointer"
											>
												Current
											</Label>
										</XStack>
									</XStack>
									<MonthYearPicker
										value={
											isCurrent(form.endDate)
												? ""
												: form.endDate
										}
										onChange={(val) =>
											updateField("endDate", val)
										}
										disabled={isCurrent(form.endDate)}
									/>
								</InputLabelWrapper>
							</XStack>

							<InputLabelWrapper>
								<Label htmlFor="we-type" showRequiredIcon>
									Type
								</Label>
								<Select
									value={form.type || null}
									onValueChange={(val) =>
										updateField("type", val)
									}
									options={TYPE_OPTIONS}
									placeholder="Select type"
								/>
							</InputLabelWrapper>

							<InputLabelWrapper>
								<Label htmlFor="we-summary">Summary</Label>
								<Textarea
									id="we-summary"
									value={form.summary}
									onChange={(
										e: React.ChangeEvent<HTMLTextAreaElement>,
									) => updateField("summary", e.target.value)}
									placeholder="Brief description of your role..."
								/>
							</InputLabelWrapper>

							<InputLabelWrapper>
								<Label>Highlights</Label>
								<MultiInput
									values={form.highlights}
									onChange={(val) =>
										updateField("highlights", val)
									}
									max={20}
								/>
							</InputLabelWrapper>
						</YStack>
					</div>
					<DialogFooter className="pt-4">
						<Button variant="outline" onClick={closeDialog}>
							Cancel
						</Button>
						<Button onClick={handleSave} disabled={isSaving}>
							{isSaving ? "Saving..." : "Save"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	)
}
