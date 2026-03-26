"use client"

import {
	INTERACTION_TYPES,
	type TInteraction,
	type TInteractionType,
} from "@aja-api/interaction/schema/interaction-schema"
import {
	useAction,
	useActionError,
	useIsLoading,
	useToastOnError,
} from "@aja-core/next-safe-action/hooks"
import { Button } from "@aja-design/ui/library/button"
import { InputGroup } from "@aja-design/ui/library/input-group"
import { Label } from "@aja-design/ui/library/label"
import { Select } from "@aja-design/ui/library/select"
import { Textarea } from "@aja-design/ui/library/text-area"
import { toast } from "@aja-design/ui/library/toast"
import { XStack } from "@aja-design/ui/primitives/x-stack"
import { YStack } from "@aja-design/ui/primitives/y-stack"
import { createRoleInteractionAction } from "#actions/role-interactions"
import { useState } from "react"

const INTERACTION_TYPE_OPTIONS = INTERACTION_TYPES.map((t) => ({
	label: t,
	value: t,
}))

interface IAddInteractionFormProps {
	roleId: string
	linkedPeople: Array<{ personId: string; name: string }>
	onCreated: (interaction: TInteraction) => void
}

export function AddInteractionForm({
	roleId,
	linkedPeople,
	onCreated,
}: IAddInteractionFormProps) {
	const [expanded, setExpanded] = useState(false)
	const [type, setType] = useState<TInteractionType | "">("")
	const [personId, setPersonId] = useState("")
	const [notes, setNotes] = useState("")

	const { execute, result, status } = useAction(createRoleInteractionAction, {
		onSuccess: ({ data }) => {
			if (data) {
				toast.success("Interaction added!")
				onCreated(data)
				setType("")
				setPersonId("")
				setNotes("")
				setExpanded(false)
			}
		},
	})

	const error = useActionError(result)
	useToastOnError(error, status)
	const isLoading = useIsLoading(status)

	const personOptions = linkedPeople.map((p) => ({
		label: p.name,
		value: p.personId,
	}))

	const handleAdd = () => {
		if (!type) return
		execute({
			roleId,
			personId: personId || null,
			type,
			notes: notes.trim() || null,
		})
	}

	if (!expanded) {
		return (
			<Button variant="outline" onClick={() => setExpanded(true)}>
				+ Add Interaction
			</Button>
		)
	}

	return (
		<YStack className="gap-3 border rounded-md p-3">
			<XStack className="gap-2">
				<InputGroup className="flex-1">
					<Label showRequiredIcon>Type</Label>
					<Select
						value={type || null}
						onValueChange={setType}
						options={INTERACTION_TYPE_OPTIONS}
						placeholder="Select type"
					/>
				</InputGroup>
				{personOptions.length > 0 && (
					<InputGroup className="flex-1">
						<Label>Person</Label>
						<Select
							value={personId || null}
							onValueChange={setPersonId}
							options={personOptions}
							placeholder="Optional"
						/>
					</InputGroup>
				)}
			</XStack>
			<InputGroup>
				<Label>Notes</Label>
				<Textarea
					value={notes}
					onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
						setNotes(e.target.value)
					}
					placeholder="Notes about this interaction..."
					rows={2}
				/>
			</InputGroup>
			<XStack className="gap-2 justify-end">
				<Button
					variant="ghost"
					size="sm"
					onClick={() => setExpanded(false)}
				>
					Cancel
				</Button>
				<Button
					size="sm"
					onClick={handleAdd}
					disabled={!type || isLoading}
				>
					{isLoading ? "Adding..." : "Add"}
				</Button>
			</XStack>
		</YStack>
	)
}
