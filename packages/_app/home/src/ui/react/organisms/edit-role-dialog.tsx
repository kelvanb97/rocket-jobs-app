"use client"

import type {
	TCompany,
	TCompanySize,
	TCompanyStage,
} from "@rja-api/company/schema/company-schema"
import type { TInteraction } from "@rja-api/interaction/schema/interaction-schema"
import type { TPerson } from "@rja-api/person/schema/person-schema"
import type { TRolePerson } from "@rja-api/role-person/schema/role-person-schema"
import type { TRole } from "@rja-api/role/schema/role-schema"
import type { TScore } from "@rja-api/score/schema/score-schema"
import {
	useAction,
	useActionError,
	useIsLoading,
	useToastOnError,
} from "@rja-core/next-safe-action/hooks"
import { Button } from "@rja-design/ui/library/button"
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@rja-design/ui/library/dialog"
import { toast } from "@rja-design/ui/library/toast"
import { XStack } from "@rja-design/ui/primitives/x-stack"
import { YStack } from "@rja-design/ui/primitives/y-stack"
import { generateApplicationDocsAction } from "#actions/generate-application-docs"
import {
	getRoleApplicationAction,
	removeApplicationFile,
	saveRoleApplicationAction,
	uploadApplicationFile,
} from "#actions/role-application"
import {
	deleteRoleInteractionAction,
	listRoleInteractionsAction,
} from "#actions/role-interactions"
import {
	listRolePeopleAction,
	unlinkPersonFromRoleAction,
} from "#actions/role-people"
import { scoreRoleAction } from "#actions/score-role"
import { updateRoleWithCompanyAction } from "#actions/update-role-with-company"
import { AddInteractionForm } from "#molecules/add-interaction-form"
import { AddPersonToRole } from "#molecules/add-person-to-role"
import { ApplicationFieldsCard } from "#molecules/application-fields-card"
import {
	CompanyFieldsCard,
	type ICompanyFieldsValues,
} from "#molecules/company-fields-card"
import { InteractionList } from "#molecules/interaction-list"
import {
	RoleFieldsCard,
	type IRoleFieldsValues,
} from "#molecules/role-fields-card"
import { RolePersonList } from "#molecules/role-person-list"
import { useEffect, useState } from "react"

type Tab = "details" | "people" | "interactions" | "application" | "score"

function roleToFieldValues(role: TRole): IRoleFieldsValues {
	return {
		title: role.title,
		url: role.url ?? "",
		description: role.description ?? "",
		source: role.source ?? "",
		locationType: role.locationType ?? "",
		location: role.location ?? "",
		salaryMin: role.salaryMin?.toString() ?? "",
		salaryMax: role.salaryMax?.toString() ?? "",
		notes: role.notes ?? "",
	}
}

function companyToFieldValues(company: TCompany | null): ICompanyFieldsValues {
	return {
		name: company?.name ?? "",
		website: company?.website ?? "",
		linkedinUrl: company?.linkedinUrl ?? "",
		size: company?.size ?? "",
		stage: company?.stage ?? "",
		industry: company?.industry ?? "",
		notes: company?.notes ?? "",
	}
}

// --- People Tab ---

function RolePeopleTab({ roleId }: { roleId: number }) {
	const [people, setPeople] = useState<
		Array<{ rolePerson: TRolePerson; person: TPerson }>
	>([])
	const [unlinkingId, setUnlinkingId] = useState<number | null>(null)

	const { execute: fetchPeople } = useAction(listRolePeopleAction, {
		onSuccess: ({ data }) => {
			if (data) setPeople(data)
		},
	})

	const {
		execute: executeUnlink,
		result: unlinkResult,
		status: unlinkStatus,
	} = useAction(unlinkPersonFromRoleAction, {
		onSuccess: ({ data }) => {
			if (data) {
				toast.success("Person unlinked")
				setUnlinkingId(null)
				fetchPeople({ roleId })
			}
		},
	})

	const unlinkError = useActionError(unlinkResult)
	useToastOnError(unlinkError, unlinkStatus)

	useEffect(() => {
		fetchPeople({ roleId })
	}, [roleId, fetchPeople])

	const handleUnlink = (personId: number) => {
		setUnlinkingId(personId)
		executeUnlink({ roleId, personId })
	}

	return (
		<YStack className="gap-4">
			<RolePersonList
				people={people}
				onUnlink={handleUnlink}
				unlinkingId={unlinkingId}
			/>
			<AddPersonToRole
				roleId={roleId}
				onPersonLinked={() => fetchPeople({ roleId })}
			/>
		</YStack>
	)
}

// --- Interactions Tab ---

function RoleInteractionsTab({ roleId }: { roleId: number }) {
	const [interactions, setInteractions] = useState<TInteraction[]>([])
	const [personNames, setPersonNames] = useState<Map<number, string>>(
		new Map(),
	)
	const [deletingId, setDeletingId] = useState<number | null>(null)

	const [linkedPeople, setLinkedPeople] = useState<
		Array<{ personId: number; name: string }>
	>([])

	const { execute: fetchInteractions } = useAction(
		listRoleInteractionsAction,
		{
			onSuccess: ({ data }) => {
				if (data) setInteractions(data)
			},
		},
	)

	const { execute: fetchPeople } = useAction(listRolePeopleAction, {
		onSuccess: ({ data }) => {
			if (data) {
				setLinkedPeople(
					data.map((d) => ({
						personId: d.person.id,
						name: d.person.name,
					})),
				)
				const names = new Map<number, string>()
				for (const d of data) {
					names.set(d.person.id, d.person.name)
				}
				setPersonNames(names)
			}
		},
	})

	const {
		execute: executeDelete,
		result: deleteResult,
		status: deleteStatus,
	} = useAction(deleteRoleInteractionAction, {
		onSuccess: ({ data }) => {
			if (data) {
				toast.success("Interaction deleted")
				setDeletingId(null)
				setInteractions((prev) => prev.filter((i) => i.id !== data.id))
			}
		},
	})

	const deleteError = useActionError(deleteResult)
	useToastOnError(deleteError, deleteStatus)

	useEffect(() => {
		fetchInteractions({ roleId })
		fetchPeople({ roleId })
	}, [roleId, fetchInteractions, fetchPeople])

	const handleCreated = (interaction: TInteraction) => {
		setInteractions((prev) => [interaction, ...prev])
	}

	const handleDelete = (id: number) => {
		setDeletingId(id)
		executeDelete({ id })
	}

	return (
		<YStack className="gap-4">
			<AddInteractionForm
				roleId={roleId}
				linkedPeople={linkedPeople}
				onCreated={handleCreated}
			/>
			<InteractionList
				interactions={interactions}
				personNames={personNames}
				onDelete={handleDelete}
				deletingId={deletingId}
			/>
		</YStack>
	)
}

// --- Application Tab ---

function useRoleApplication(roleId: number | null) {
	const [applicationId, setApplicationId] = useState<number | null>(null)
	const [resumeUrl, setResumeUrl] = useState<string | null>(null)
	const [coverLetterUrl, setCoverLetterUrl] = useState<string | null>(null)
	const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null)
	const [notes, setNotes] = useState("")
	const [uploadingType, setUploadingType] = useState<
		"resume" | "cover_letter" | null
	>(null)
	const [removingType, setRemovingType] = useState<
		"resume" | "cover_letter" | null
	>(null)

	const { execute: fetchApplication } = useAction(getRoleApplicationAction, {
		onSuccess: ({ data }) => {
			if (data) {
				setApplicationId(data.id)
				setResumeUrl(data.resumePath)
				setCoverLetterUrl(data.coverLetterPath)
				setScreenshotUrl(data.screenshotPath)
				setNotes(data.notes ?? "")
			} else {
				setApplicationId(null)
				setResumeUrl(null)
				setCoverLetterUrl(null)
				setScreenshotUrl(null)
				setNotes("")
			}
		},
	})

	const {
		execute: executeSave,
		result: saveResult,
		status: saveStatus,
	} = useAction(saveRoleApplicationAction, {
		onSuccess: ({ data }) => {
			if (data) {
				toast.success("Notes saved!")
				setApplicationId(data.id)
			}
		},
	})

	const saveError = useActionError(saveResult)
	useToastOnError(saveError, saveStatus)
	const isSaving = useIsLoading(saveStatus)

	useEffect(() => {
		if (roleId) fetchApplication({ roleId })
	}, [roleId, fetchApplication])

	const handleSave = () => {
		if (!roleId) return
		executeSave({
			id: applicationId ?? undefined,
			roleId,
			notes: notes || null,
		})
	}

	const handleUpload = async (
		fileType: "resume" | "cover_letter",
		file: File,
	) => {
		if (!roleId) return
		setUploadingType(fileType)
		try {
			const formData = new FormData()
			formData.append("roleId", String(roleId))
			formData.append("fileType", fileType)
			formData.append("file", file)
			const result = await uploadApplicationFile(formData)
			setApplicationId(result.application.id)
			if (fileType === "resume") {
				setResumeUrl(result.url)
			} else {
				setCoverLetterUrl(result.url)
			}
			toast.success("File uploaded!")
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Upload failed")
		} finally {
			setUploadingType(null)
		}
	}

	const handleRemove = async (fileType: "resume" | "cover_letter") => {
		if (!roleId || !applicationId) return
		setRemovingType(fileType)
		try {
			const updated = await removeApplicationFile(
				roleId,
				applicationId,
				fileType,
			)
			setApplicationId(updated.id)
			if (fileType === "resume") {
				setResumeUrl(null)
			} else {
				setCoverLetterUrl(null)
			}
			toast.success("File removed!")
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Remove failed")
		} finally {
			setRemovingType(null)
		}
	}

	return {
		resumeUrl,
		setResumeUrl,
		coverLetterUrl,
		setCoverLetterUrl,
		screenshotUrl,
		notes,
		setNotes,
		handleSave,
		isSaving,
		handleUpload,
		handleRemove,
		uploadingType,
		removingType,
	}
}

// --- Score Tab ---

function RoleScoreTab({
	score,
	roleId,
	onScoreUpdated,
}: {
	score: TScore | null
	roleId: number
	onScoreUpdated: (score: TScore) => void
}) {
	const {
		execute: executeScore,
		result: scoreResult,
		status: scoreStatus,
	} = useAction(scoreRoleAction, {
		onSuccess: ({ data }) => {
			if (data) {
				toast.success("Role scored!")
				onScoreUpdated(data)
			}
		},
	})

	const scoreError = useActionError(scoreResult)
	useToastOnError(scoreError, scoreStatus)
	const isScoring = useIsLoading(scoreStatus)

	if (!score) {
		return (
			<YStack className="items-center justify-center gap-4 py-8">
				<p className="text-sm text-muted-foreground">
					This role has not been scored yet.
				</p>
				<Button
					onClick={() => executeScore({ roleId })}
					disabled={isScoring}
				>
					{isScoring ? "Scoring..." : "Score"}
				</Button>
			</YStack>
		)
	}

	const scoreColor =
		score.score >= 70
			? "text-green-600"
			: score.score >= 40
				? "text-yellow-600"
				: "text-red-600"

	return (
		<YStack className="gap-6 p-1">
			<XStack className="items-center justify-between">
				<div className={`text-5xl font-bold ${scoreColor}`}>
					{score.score}
					<span className="text-xl font-normal text-muted-foreground">
						{" "}
						/ 100
					</span>
				</div>
				<Button
					variant="outline"
					size="sm"
					onClick={() => executeScore({ roleId })}
					disabled={isScoring}
				>
					{isScoring ? "Scoring..." : "Re-score"}
				</Button>
			</XStack>
			<YStack className="gap-2">
				<p className="font-semibold">Strengths</p>
				{score.positive && score.positive.length > 0 ? (
					<ul className="list-disc pl-5 space-y-1">
						{score.positive.map((item, i) => (
							<li key={i} className="text-sm">
								{item}
							</li>
						))}
					</ul>
				) : (
					<p className="text-sm text-muted-foreground">None</p>
				)}
			</YStack>
			<YStack className="gap-2">
				<p className="font-semibold">Concerns</p>
				{score.negative && score.negative.length > 0 ? (
					<ul className="list-disc pl-5 space-y-1">
						{score.negative.map((item, i) => (
							<li key={i} className="text-sm">
								{item}
							</li>
						))}
					</ul>
				) : (
					<p className="text-sm text-muted-foreground">None</p>
				)}
			</YStack>
		</YStack>
	)
}

// --- Main Dialog ---

interface IEditRoleDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	role: TRole | null
	company: TCompany | null
	score: TScore | null
	onSaved: (role: TRole) => void
	onScoreUpdated: (roleId: number, score: TScore) => void
}

export function EditRoleDialog({
	open,
	onOpenChange,
	role,
	company,
	score,
	onSaved,
	onScoreUpdated,
}: IEditRoleDialogProps) {
	const [activeTab, setActiveTab] = useState<Tab>("details")
	const [roleFields, setRoleFields] = useState<IRoleFieldsValues>(
		roleToFieldValues(role ?? ({ title: "" } as TRole)),
	)
	const [companyFields, setCompanyFields] = useState<ICompanyFieldsValues>(
		companyToFieldValues(company),
	)

	useEffect(() => {
		if (role) setRoleFields(roleToFieldValues(role))
		setCompanyFields(companyToFieldValues(company))
		setActiveTab("details")
	}, [role, company])

	const { execute, result, status } = useAction(updateRoleWithCompanyAction, {
		onSuccess: ({ data }) => {
			if (data) {
				toast.success("Role updated!")
				onSaved(data)
				onOpenChange(false)
			}
		},
	})

	const error = useActionError(result)
	useToastOnError(error, status)
	const isLoading = useIsLoading(status)

	const handleSave = () => {
		if (!role) return

		const roleInput: Record<string, unknown> = { id: role.id }
		if (roleFields.title !== role.title)
			roleInput["title"] = roleFields.title
		if (roleFields.url !== (role.url ?? ""))
			roleInput["url"] = roleFields.url || null
		if (roleFields.description !== (role.description ?? ""))
			roleInput["description"] = roleFields.description || null
		if (roleFields.source !== (role.source ?? ""))
			roleInput["source"] = roleFields.source || null
		if (roleFields.locationType !== (role.locationType ?? ""))
			roleInput["locationType"] = roleFields.locationType || null
		if (roleFields.location !== (role.location ?? ""))
			roleInput["location"] = roleFields.location || null

		const newMin = roleFields.salaryMin
			? Number(roleFields.salaryMin)
			: null
		if (newMin !== role.salaryMin) roleInput["salaryMin"] = newMin
		const newMax = roleFields.salaryMax
			? Number(roleFields.salaryMax)
			: null
		if (newMax !== role.salaryMax) roleInput["salaryMax"] = newMax

		if (roleFields.notes !== (role.notes ?? ""))
			roleInput["notes"] = roleFields.notes || null

		const companyInput =
			company && companyFields.name.trim()
				? {
						id: company.id,
						name: companyFields.name,
						website: companyFields.website || null,
						linkedinUrl: companyFields.linkedinUrl || null,
						size: (companyFields.size as TCompanySize) || null,
						stage: (companyFields.stage as TCompanyStage) || null,
						industry: companyFields.industry || null,
						notes: companyFields.notes || null,
					}
				: undefined

		execute({
			role: roleInput as { id: number },
			company: companyInput,
		})
	}

	const app = useRoleApplication(role?.id ?? null)

	const {
		execute: executeGenerate,
		result: generateResult,
		status: generateStatus,
	} = useAction(generateApplicationDocsAction, {
		onSuccess: ({ data }) => {
			if (data) {
				toast.success("Resume & cover letter generated!")
				app.setResumeUrl(data.resumePath)
				app.setCoverLetterUrl(data.coverLetterPath)
			}
		},
	})

	const generateError = useActionError(generateResult)
	useToastOnError(generateError, generateStatus)
	const isGenerating = useIsLoading(generateStatus)

	const tabs: Array<{ key: Tab; label: string }> = [
		{ key: "details", label: "Details" },
		{ key: "people", label: "People" },
		{ key: "interactions", label: "Interactions" },
		{ key: "application", label: "Application" },
		{ key: "score", label: "Score" },
	]

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
				<DialogHeader>
					<DialogTitle>Edit Role</DialogTitle>
				</DialogHeader>
				<XStack className="gap-1 border-b pb-2">
					{tabs.map((tab) => (
						<Button
							key={tab.key}
							variant={
								activeTab === tab.key ? "default" : "outline"
							}
							size="sm"
							onClick={() => setActiveTab(tab.key)}
						>
							{tab.label}
						</Button>
					))}
				</XStack>
				<div className="flex-1 overflow-y-auto">
					{activeTab === "details" && (
						<YStack className="gap-6">
							<CompanyFieldsCard
								values={companyFields}
								onChange={setCompanyFields}
							/>
							<RoleFieldsCard
								values={roleFields}
								onChange={setRoleFields}
							/>
						</YStack>
					)}
					{activeTab === "people" && role && (
						<RolePeopleTab roleId={role.id} />
					)}
					{activeTab === "interactions" && role && (
						<RoleInteractionsTab roleId={role.id} />
					)}
					{activeTab === "score" && role && (
						<RoleScoreTab
							score={score}
							roleId={role.id}
							onScoreUpdated={(s) => onScoreUpdated(role.id, s)}
						/>
					)}
					{activeTab === "application" && role && (
						<ApplicationFieldsCard
							resumeUrl={app.resumeUrl}
							coverLetterUrl={app.coverLetterUrl}
							screenshotUrl={app.screenshotUrl}
							notes={app.notes}
							onNotesChange={app.setNotes}
							onUpload={app.handleUpload}
							onRemove={app.handleRemove}
							uploadingType={app.uploadingType}
							removingType={app.removingType}
							onGenerate={() =>
								executeGenerate({ roleId: role.id })
							}
							isGenerating={isGenerating}
						/>
					)}
				</div>
				{activeTab === "details" && (
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							Cancel
						</Button>
						<Button onClick={handleSave} disabled={isLoading}>
							{isLoading ? "Saving..." : "Save"}
						</Button>
					</DialogFooter>
				)}
				{activeTab === "application" && (
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							Cancel
						</Button>
						<Button
							onClick={app.handleSave}
							disabled={app.isSaving}
						>
							{app.isSaving ? "Saving..." : "Save"}
						</Button>
					</DialogFooter>
				)}
			</DialogContent>
		</Dialog>
	)
}
