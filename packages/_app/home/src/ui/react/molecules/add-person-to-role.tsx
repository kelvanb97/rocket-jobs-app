"use client"

import type { TPerson } from "@rja-api/person/schema/person-schema"
import { ROLE_PERSON_RELATIONSHIPS } from "@rja-api/role-person/schema/role-person-schema"
import {
	useAction,
	useActionError,
	useIsLoading,
	useToastOnError,
} from "@rja-core/next-safe-action/hooks"
import { Button } from "@rja-design/ui/library/button"
import { Input } from "@rja-design/ui/library/input"
import { InputGroup } from "@rja-design/ui/library/input-group"
import { Label } from "@rja-design/ui/library/label"
import { Textarea } from "@rja-design/ui/library/text-area"
import { toast } from "@rja-design/ui/library/toast"
import { XStack } from "@rja-design/ui/primitives/x-stack"
import { YStack } from "@rja-design/ui/primitives/y-stack"
import {
	createAndLinkPersonAction,
	linkPersonToRoleAction,
	searchPersonsAction,
} from "#actions/role-people"
import { useCallback, useEffect, useRef, useState } from "react"

const RELATIONSHIP_SUGGESTIONS = [...ROLE_PERSON_RELATIONSHIPS]

interface IAddPersonToRoleProps {
	roleId: number
	onPersonLinked: () => void
}

export function AddPersonToRole({
	roleId,
	onPersonLinked,
}: IAddPersonToRoleProps) {
	const [search, setSearch] = useState("")
	const [results, setResults] = useState<TPerson[]>([])
	const [showResults, setShowResults] = useState(false)
	const [selectedPerson, setSelectedPerson] = useState<TPerson | null>(null)
	const [showCreateForm, setShowCreateForm] = useState(false)
	const [relationship, setRelationship] = useState("")
	const [newName, setNewName] = useState("")
	const [newEmail, setNewEmail] = useState("")
	const [newTitle, setNewTitle] = useState("")
	const [newLinkedinUrl, setNewLinkedinUrl] = useState("")
	const [newNotes, setNewNotes] = useState("")
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	const { execute: executeSearch } = useAction(searchPersonsAction, {
		onSuccess: ({ data }) => {
			if (data) {
				setResults(data)
				setShowResults(true)
			}
		},
	})

	const {
		execute: executeLink,
		result: linkResult,
		status: linkStatus,
	} = useAction(linkPersonToRoleAction, {
		onSuccess: () => {
			toast.success("Person linked!")
			resetState()
			onPersonLinked()
		},
	})

	const {
		execute: executeCreateAndLink,
		result: createResult,
		status: createStatus,
	} = useAction(createAndLinkPersonAction, {
		onSuccess: () => {
			toast.success("Person created and linked!")
			resetState()
			onPersonLinked()
		},
	})

	const linkError = useActionError(linkResult)
	useToastOnError(linkError, linkStatus)
	const createError = useActionError(createResult)
	useToastOnError(createError, createStatus)

	const isLinking = useIsLoading(linkStatus)
	const isCreating = useIsLoading(createStatus)

	const resetState = useCallback(() => {
		setSearch("")
		setResults([])
		setShowResults(false)
		setSelectedPerson(null)
		setShowCreateForm(false)
		setRelationship("")
		setNewName("")
		setNewEmail("")
		setNewTitle("")
		setNewLinkedinUrl("")
		setNewNotes("")
	}, [])

	useEffect(() => {
		if (debounceRef.current) clearTimeout(debounceRef.current)
		if (search.trim().length < 2) {
			setResults([])
			setShowResults(false)
			return
		}
		debounceRef.current = setTimeout(() => {
			executeSearch({ search: search.trim() })
		}, 300)
		return () => {
			if (debounceRef.current) clearTimeout(debounceRef.current)
		}
	}, [search, executeSearch])

	const handleSelectPerson = (person: TPerson) => {
		setSelectedPerson(person)
		setShowResults(false)
		setShowCreateForm(false)
	}

	const handleStartCreate = () => {
		setSelectedPerson(null)
		setShowCreateForm(true)
		setShowResults(false)
		setNewName(search)
	}

	const handleLink = () => {
		if (!selectedPerson) return
		executeLink({
			roleId,
			personId: selectedPerson.id,
			relationship: relationship || null,
		})
	}

	const handleCreateAndLink = () => {
		if (!newName.trim()) return
		executeCreateAndLink({
			roleId,
			name: newName.trim(),
			email: newEmail.trim() || null,
			title: newTitle.trim() || null,
			linkedinUrl: newLinkedinUrl.trim() || null,
			notes: newNotes.trim() || null,
			relationship: relationship || null,
		})
	}

	return (
		<YStack className="gap-3">
			{!selectedPerson && !showCreateForm && (
				<>
					<div className="relative">
						<Input
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder="Search people to link..."
						/>
						{showResults && (
							<div className="absolute z-10 top-full left-0 right-0 mt-1 border rounded-md bg-popover shadow-md max-h-48 overflow-y-auto">
								{results.map((person) => (
									<button
										key={person.id}
										type="button"
										className="w-full text-left px-3 py-2 hover:bg-accent text-sm"
										onClick={() =>
											handleSelectPerson(person)
										}
									>
										<span className="font-medium">
											{person.name}
										</span>
										{(person.title || person.email) && (
											<span className="text-muted-foreground ml-2 text-xs">
												{[person.title, person.email]
													.filter(Boolean)
													.join(" · ")}
											</span>
										)}
									</button>
								))}
							</div>
						)}
					</div>
					<Button variant="outline" onClick={handleStartCreate}>
						+ Create new person
					</Button>
				</>
			)}

			{selectedPerson && (
				<YStack className="gap-3 border rounded-md p-3">
					<XStack className="items-center justify-between">
						<span className="text-sm font-medium">
							{selectedPerson.name}
							{selectedPerson.title && (
								<span className="text-muted-foreground ml-1">
									— {selectedPerson.title}
								</span>
							)}
						</span>
						<Button variant="ghost" size="sm" onClick={resetState}>
							Cancel
						</Button>
					</XStack>
					<XStack className="gap-2 items-end">
						<InputGroup className="flex-1">
							<Label>Relationship</Label>
							<Input
								value={relationship}
								onChange={(e) =>
									setRelationship(e.target.value)
								}
								list="relationship-suggestions"
								placeholder="e.g. Recruiter, Hiring Manager"
							/>
						</InputGroup>
						<Button
							onClick={handleLink}
							disabled={isLinking}
							size="sm"
						>
							{isLinking ? "Linking..." : "Link"}
						</Button>
					</XStack>
					<datalist id="relationship-suggestions">
						{RELATIONSHIP_SUGGESTIONS.map((r) => (
							<option key={r} value={r} />
						))}
					</datalist>
				</YStack>
			)}

			{showCreateForm && (
				<YStack className="gap-3 border rounded-md p-3">
					<XStack className="items-center justify-between">
						<span className="text-sm font-medium">
							Create new person
						</span>
						<Button variant="ghost" size="sm" onClick={resetState}>
							Cancel
						</Button>
					</XStack>
					<InputGroup>
						<Label showRequiredIcon>Name</Label>
						<Input
							value={newName}
							onChange={(e) => setNewName(e.target.value)}
							placeholder="Full name"
						/>
					</InputGroup>
					<XStack className="gap-2">
						<InputGroup className="flex-1">
							<Label>Email</Label>
							<Input
								value={newEmail}
								onChange={(e) => setNewEmail(e.target.value)}
								placeholder="email@example.com"
							/>
						</InputGroup>
						<InputGroup className="flex-1">
							<Label>Title</Label>
							<Input
								value={newTitle}
								onChange={(e) => setNewTitle(e.target.value)}
								placeholder="Job title"
							/>
						</InputGroup>
					</XStack>
					<InputGroup>
						<Label>LinkedIn URL</Label>
						<Input
							value={newLinkedinUrl}
							onChange={(e) => setNewLinkedinUrl(e.target.value)}
							placeholder="https://linkedin.com/in/..."
						/>
					</InputGroup>
					<InputGroup>
						<Label>Notes</Label>
						<Textarea
							value={newNotes}
							onChange={(
								e: React.ChangeEvent<HTMLTextAreaElement>,
							) => setNewNotes(e.target.value)}
							placeholder="Notes about this person..."
							rows={2}
						/>
					</InputGroup>
					<XStack className="gap-2 items-end">
						<InputGroup className="flex-1">
							<Label>Relationship</Label>
							<Input
								value={relationship}
								onChange={(e) =>
									setRelationship(e.target.value)
								}
								list="relationship-suggestions-create"
								placeholder="e.g. Recruiter, Hiring Manager"
							/>
							<datalist id="relationship-suggestions-create">
								{RELATIONSHIP_SUGGESTIONS.map((r) => (
									<option key={r} value={r} />
								))}
							</datalist>
						</InputGroup>
						<Button
							onClick={handleCreateAndLink}
							disabled={isCreating || !newName.trim()}
							size="sm"
						>
							{isCreating ? "Creating..." : "Create & Link"}
						</Button>
					</XStack>
				</YStack>
			)}
		</YStack>
	)
}
