"use client"

import {
	useAction,
	useActionError,
	useIsLoading,
	useToastOnError,
} from "@rja-core/next-safe-action/hooks"
import { Button } from "@rja-design/ui/library/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@rja-design/ui/library/card"
import { Input } from "@rja-design/ui/library/input"
import { InputLabelWrapper } from "@rja-design/ui/library/input-label-wrapper"
import { Label } from "@rja-design/ui/library/label"
import { toast } from "@rja-design/ui/library/toast"
import { XStack } from "@rja-design/ui/primitives/x-stack"
import { YStack } from "@rja-design/ui/primitives/y-stack"
import {
	deleteEducationAction,
	upsertEducationAction,
} from "#actions/settings-actions"
import { useState } from "react"

interface IEducationEntry {
	id: number
	userProfileId: number
	sortOrder: number
	degree: string
	field: string
	institution: string
	gpa: string
	createdAt: Date | null
	updatedAt: Date | null
}

interface IEducationCardProps {
	profileId: number
	education: IEducationEntry[]
	onSaved: () => void
}

interface IEducationForm {
	id?: number
	degree: string
	field: string
	institution: string
	gpa: string
}

const EMPTY_FORM: IEducationForm = {
	degree: "",
	field: "",
	institution: "",
	gpa: "",
}

export function EducationCard({
	profileId,
	education,
	onSaved,
}: IEducationCardProps) {
	const [entries, setEntries] = useState<IEducationEntry[]>(education)
	const [editingId, setEditingId] = useState<number | null>(null)
	const [isAdding, setIsAdding] = useState(false)
	const [form, setForm] = useState<IEducationForm>(EMPTY_FORM)

	const {
		execute: executeUpsert,
		result: upsertResult,
		status: upsertStatus,
	} = useAction(upsertEducationAction, {
		onSuccess: ({ data }) => {
			if (data) {
				if (editingId !== null) {
					setEntries((prev) =>
						prev.map((e) => (e.id === editingId ? data : e)),
					)
					setEditingId(null)
					toast.success("Education updated!")
				} else {
					setEntries((prev) => [...prev, data])
					setIsAdding(false)
					toast.success("Education added!")
				}
				setForm(EMPTY_FORM)
				onSaved()
			}
		},
	})
	const upsertError = useActionError(upsertResult)
	useToastOnError(upsertError, upsertStatus)
	const isUpsertLoading = useIsLoading(upsertStatus)

	const {
		execute: executeDelete,
		result: deleteResult,
		status: deleteStatus,
	} = useAction(deleteEducationAction, {
		onSuccess: () => {
			toast.success("Education deleted!")
			onSaved()
		},
	})
	const deleteError = useActionError(deleteResult)
	useToastOnError(deleteError, deleteStatus)
	const isDeleteLoading = useIsLoading(deleteStatus)

	const handleSave = () => {
		const sortOrder =
			editingId !== null
				? entries.findIndex((e) => e.id === editingId)
				: entries.length

		executeUpsert({
			id: form.id,
			userProfileId: profileId,
			sortOrder,
			degree: form.degree,
			field: form.field,
			institution: form.institution,
			gpa: form.gpa,
		})
	}

	const handleEdit = (entry: IEducationEntry) => {
		setEditingId(entry.id)
		setIsAdding(false)
		setForm({
			id: entry.id,
			degree: entry.degree,
			field: entry.field,
			institution: entry.institution,
			gpa: entry.gpa,
		})
	}

	const handleDelete = (id: number) => {
		setEntries((prev) => prev.filter((e) => e.id !== id))
		executeDelete({ id })
	}

	const handleCancel = () => {
		setEditingId(null)
		setIsAdding(false)
		setForm(EMPTY_FORM)
	}

	const handleAdd = () => {
		setIsAdding(true)
		setEditingId(null)
		setForm(EMPTY_FORM)
	}

	const renderForm = () => (
		<YStack className="gap-3 border rounded-md p-3">
			<XStack className="gap-4">
				<InputLabelWrapper className="flex-1">
					<Label showRequiredIcon>Degree</Label>
					<Input
						value={form.degree}
						onChange={(e) =>
							setForm((f) => ({ ...f, degree: e.target.value }))
						}
						placeholder="B.S."
					/>
				</InputLabelWrapper>
				<InputLabelWrapper className="flex-1">
					<Label showRequiredIcon>Field</Label>
					<Input
						value={form.field}
						onChange={(e) =>
							setForm((f) => ({ ...f, field: e.target.value }))
						}
						placeholder="Computer Science"
					/>
				</InputLabelWrapper>
			</XStack>
			<InputLabelWrapper>
				<Label showRequiredIcon>Institution</Label>
				<Input
					value={form.institution}
					onChange={(e) =>
						setForm((f) => ({
							...f,
							institution: e.target.value,
						}))
					}
					placeholder="University of California, Berkeley"
				/>
			</InputLabelWrapper>
			<InputLabelWrapper>
				<Label>GPA</Label>
				<Input
					value={form.gpa}
					onChange={(e) =>
						setForm((f) => ({ ...f, gpa: e.target.value }))
					}
					placeholder="3.85"
				/>
			</InputLabelWrapper>
			<XStack className="gap-2 justify-end">
				<Button variant="ghost" size="sm" onClick={handleCancel}>
					Cancel
				</Button>
				<Button
					size="sm"
					onClick={handleSave}
					disabled={
						!form.degree ||
						!form.field ||
						!form.institution ||
						isUpsertLoading
					}
				>
					{isUpsertLoading ? "Saving..." : "Save"}
				</Button>
			</XStack>
		</YStack>
	)

	return (
		<Card>
			<CardHeader>
				<CardTitle>Education</CardTitle>
				<CardDescription>
					Your educational background and degrees.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<YStack className="gap-3">
					{entries.map((entry) =>
						editingId === entry.id ? (
							<div key={entry.id}>{renderForm()}</div>
						) : (
							<XStack
								key={entry.id}
								className="items-center justify-between border rounded-md px-3 py-2"
							>
								<YStack className="gap-0.5">
									<span className="text-sm font-medium">
										{entry.degree} in {entry.field}
									</span>
									<span className="text-sm text-muted-foreground">
										{entry.institution}
									</span>
									{entry.gpa && (
										<span className="text-sm text-muted-foreground">
											GPA: {entry.gpa}
										</span>
									)}
								</YStack>
								<XStack className="gap-1">
									<Button
										variant="ghost"
										size="sm"
										onClick={() => handleEdit(entry)}
									>
										Edit
									</Button>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => handleDelete(entry.id)}
										disabled={isDeleteLoading}
									>
										Delete
									</Button>
								</XStack>
							</XStack>
						),
					)}

					{isAdding ? (
						renderForm()
					) : (
						<Button
							variant="outline"
							onClick={handleAdd}
							disabled={editingId !== null}
						>
							+ Add Education
						</Button>
					)}
				</YStack>
			</CardContent>
		</Card>
	)
}
