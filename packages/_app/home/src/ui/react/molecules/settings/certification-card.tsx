"use client"

import {
	useAction,
	useActionError,
	useIsLoading,
	useToastOnError,
} from "@rja-core/next-safe-action/hooks"
import { Pencil, Plus, Trash2 } from "@rja-design/ui/assets/lucide"
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
	deleteCertificationAction,
	upsertCertificationAction,
} from "#actions/settings-actions"
import { useState } from "react"

interface ICertificationEntry {
	id: number
	userProfileId: number
	sortOrder: number
	name: string
	issuer: string
	issueDate: string | null
	expirationDate: string | null
	url: string | null
	createdAt: Date | null
	updatedAt: Date | null
}

interface ICertificationCardProps {
	profileId: number
	certifications: ICertificationEntry[]
	onChanged: (entries: ICertificationEntry[]) => void
}

interface ICertificationForm {
	id?: number
	name: string
	issuer: string
	issueDate: string
	expirationDate: string
	url: string
}

const EMPTY_FORM: ICertificationForm = {
	name: "",
	issuer: "",
	issueDate: "",
	expirationDate: "",
	url: "",
}

export function CertificationCard({
	profileId,
	certifications,
	onChanged,
}: ICertificationCardProps) {
	const [entries, setEntries] =
		useState<ICertificationEntry[]>(certifications)
	const [editingId, setEditingId] = useState<number | null>(null)
	const [isAdding, setIsAdding] = useState(false)
	const [form, setForm] = useState<ICertificationForm>(EMPTY_FORM)

	const {
		execute: executeUpsert,
		result: upsertResult,
		status: upsertStatus,
	} = useAction(upsertCertificationAction, {
		onSuccess: ({ data }) => {
			if (data) {
				setEntries((prev) => {
					const next = prev.some((e) => e.id === data.id)
						? prev.map((e) => (e.id === data.id ? data : e))
						: [...prev, data]
					onChanged(next)
					return next
				})
				setEditingId(null)
				setIsAdding(false)
				setForm(EMPTY_FORM)
				toast.success("Certification saved!")
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
	} = useAction(deleteCertificationAction, {
		onSuccess: () => {
			toast.success("Certification deleted!")
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
			name: form.name,
			issuer: form.issuer,
			issueDate: form.issueDate || null,
			expirationDate: form.expirationDate || null,
			url: form.url || null,
		})
	}

	const handleEdit = (entry: ICertificationEntry) => {
		setEditingId(entry.id)
		setIsAdding(false)
		setForm({
			id: entry.id,
			name: entry.name,
			issuer: entry.issuer,
			issueDate: entry.issueDate ?? "",
			expirationDate: entry.expirationDate ?? "",
			url: entry.url ?? "",
		})
	}

	const handleDelete = (id: number) => {
		setEntries((prev) => {
			const next = prev.filter((e) => e.id !== id)
			onChanged(next)
			return next
		})
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
		<YStack className="gap-3 rounded-md border p-3">
			<XStack className="gap-4">
				<InputLabelWrapper className="flex-1">
					<Label showRequiredIcon>Name</Label>
					<Input
						value={form.name}
						onChange={(e) =>
							setForm((f) => ({ ...f, name: e.target.value }))
						}
						placeholder="AWS Solutions Architect"
					/>
				</InputLabelWrapper>
				<InputLabelWrapper className="flex-1">
					<Label showRequiredIcon>Issuer</Label>
					<Input
						value={form.issuer}
						onChange={(e) =>
							setForm((f) => ({ ...f, issuer: e.target.value }))
						}
						placeholder="Amazon Web Services"
					/>
				</InputLabelWrapper>
			</XStack>
			<XStack className="gap-4">
				<InputLabelWrapper className="flex-1">
					<Label>Issue Date</Label>
					<Input
						value={form.issueDate}
						onChange={(e) =>
							setForm((f) => ({
								...f,
								issueDate: e.target.value,
							}))
						}
						placeholder="Jan 2023"
					/>
				</InputLabelWrapper>
				<InputLabelWrapper className="flex-1">
					<Label>Expiration Date</Label>
					<Input
						value={form.expirationDate}
						onChange={(e) =>
							setForm((f) => ({
								...f,
								expirationDate: e.target.value,
							}))
						}
						placeholder="Jan 2026 or leave blank"
					/>
				</InputLabelWrapper>
			</XStack>
			<InputLabelWrapper>
				<Label>Verification URL</Label>
				<Input
					value={form.url}
					onChange={(e) =>
						setForm((f) => ({ ...f, url: e.target.value }))
					}
					placeholder="https://..."
				/>
			</InputLabelWrapper>
			<XStack className="justify-end gap-2">
				<Button variant="ghost" size="sm" onClick={handleCancel}>
					Cancel
				</Button>
				<Button
					size="sm"
					onClick={handleSave}
					disabled={!form.name || !form.issuer || isUpsertLoading}
				>
					{isUpsertLoading ? "Saving..." : "Save"}
				</Button>
			</XStack>
		</YStack>
	)

	return (
		<Card>
			<CardHeader>
				<CardTitle>Certifications</CardTitle>
				<CardDescription>
					Professional certifications and licenses.
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
								className="items-center justify-between rounded-md border px-3 py-2"
							>
								<YStack className="gap-0.5">
									<span className="text-sm font-medium">
										{entry.name}
									</span>
									<span className="text-sm text-muted-foreground">
										{entry.issuer}
										{entry.issueDate &&
											` · ${entry.issueDate}`}
										{entry.expirationDate &&
											` – ${entry.expirationDate}`}
									</span>
								</YStack>
								<XStack className="gap-1">
									<Button
										variant="ghost"
										size="icon"
										onClick={() => handleEdit(entry)}
									>
										<Pencil className="size-4" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										onClick={() => handleDelete(entry.id)}
										disabled={isDeleteLoading}
									>
										<Trash2 className="size-4 text-destructive" />
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
							<Plus className="size-4 mr-1" />
							Add Certification
						</Button>
					)}
				</YStack>
			</CardContent>
		</Card>
	)
}
