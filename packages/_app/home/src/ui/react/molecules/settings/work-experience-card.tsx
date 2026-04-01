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
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@rja-design/ui/library/dialog"
import { Input } from "@rja-design/ui/library/input"
import { InputGroup } from "@rja-design/ui/library/input-group"
import { Label } from "@rja-design/ui/library/label"
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
	platforms: string[]
	techStack: string[]
	summary: string
	highlights: string[]
	createdAt: Date | null
	updatedAt: Date | null
}

interface IWorkExperienceCardProps {
	profileId: number
	workExperience: IWorkExperienceEntry[]
	onSaved: () => void
}

const TYPE_OPTIONS = [
	{ label: "Full-time", value: "full-time" },
	{ label: "Contract", value: "contract" },
	{ label: "Founder", value: "founder" },
	{ label: "Self-employed", value: "self-employed" },
]

const EMPTY_FORM = {
	company: "",
	title: "",
	startDate: "",
	endDate: "",
	type: "",
	platforms: [] as string[],
	techStack: [] as string[],
	summary: "",
	highlights: [] as string[],
}

export function WorkExperienceCard({
	profileId,
	workExperience,
	onSaved,
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
			platforms: entry.platforms,
			techStack: entry.techStack,
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
				if (editingEntry) {
					setEntries((prev) =>
						prev.map((e) => (e.id === data.id ? data : e)),
					)
				} else {
					setEntries((prev) => [...prev, data])
				}
				closeDialog()
				onSaved()
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
				setEntries((prev) => prev.filter((e) => e.id !== data.id))
				onSaved()
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
			platforms: form.platforms,
			techStack: form.techStack,
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
				<DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
					<DialogHeader>
						<DialogTitle>
							{editingEntry
								? "Edit Experience"
								: "Add Experience"}
						</DialogTitle>
					</DialogHeader>
					<div className="flex-1 overflow-y-auto">
						<YStack className="gap-4">
							<XStack className="gap-4">
								<InputGroup className="flex-1">
									<Label htmlFor="we-company">Company</Label>
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
								</InputGroup>
								<InputGroup className="flex-1">
									<Label htmlFor="we-title">Title</Label>
									<Input
										id="we-title"
										value={form.title}
										onChange={(e) =>
											updateField("title", e.target.value)
										}
										placeholder="Senior Software Engineer"
									/>
								</InputGroup>
							</XStack>

							<XStack className="gap-4">
								<InputGroup className="flex-1">
									<Label htmlFor="we-start-date">
										Start Date
									</Label>
									<Input
										id="we-start-date"
										value={form.startDate}
										onChange={(e) =>
											updateField(
												"startDate",
												e.target.value,
											)
										}
										placeholder="Oct 2020"
									/>
								</InputGroup>
								<InputGroup className="flex-1">
									<Label htmlFor="we-end-date">
										End Date
									</Label>
									<Input
										id="we-end-date"
										value={form.endDate}
										onChange={(e) =>
											updateField(
												"endDate",
												e.target.value,
											)
										}
										placeholder="Mar 2026 or Current"
									/>
								</InputGroup>
							</XStack>

							<InputGroup>
								<Label htmlFor="we-type">Type</Label>
								<Select
									value={form.type || null}
									onValueChange={(val) =>
										updateField("type", val)
									}
									options={TYPE_OPTIONS}
									placeholder="Select type"
								/>
							</InputGroup>

							<InputGroup>
								<Label>Platforms</Label>
								<MultiInput
									values={form.platforms}
									onChange={(val) =>
										updateField("platforms", val)
									}
									max={10}
								/>
							</InputGroup>

							<InputGroup>
								<Label>Tech Stack</Label>
								<MultiInput
									values={form.techStack}
									onChange={(val) =>
										updateField("techStack", val)
									}
									max={30}
								/>
							</InputGroup>

							<InputGroup>
								<Label htmlFor="we-summary">Summary</Label>
								<Textarea
									id="we-summary"
									value={form.summary}
									onChange={(
										e: React.ChangeEvent<HTMLTextAreaElement>,
									) => updateField("summary", e.target.value)}
									placeholder="Brief description of your role..."
								/>
							</InputGroup>

							<InputGroup>
								<Label>Highlights</Label>
								<MultiInput
									values={form.highlights}
									onChange={(val) =>
										updateField("highlights", val)
									}
									max={20}
								/>
							</InputGroup>
						</YStack>
					</div>
					<DialogFooter>
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
