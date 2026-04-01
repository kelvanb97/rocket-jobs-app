"use client"

import type { TFormDefaults } from "@rja-api/settings/schema/form-defaults-schema"
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
	CardFooter,
	CardHeader,
	CardTitle,
} from "@rja-design/ui/library/card"
import { Input } from "@rja-design/ui/library/input"
import { InputGroup } from "@rja-design/ui/library/input-group"
import { Label } from "@rja-design/ui/library/label"
import { Textarea } from "@rja-design/ui/library/text-area"
import { toast } from "@rja-design/ui/library/toast"
import { YStack } from "@rja-design/ui/primitives/y-stack"
import { updateFormDefaultsAction } from "#actions/settings-actions"
import { useState } from "react"

interface IFormDefaultsCardProps {
	profileId: number
	formDefaults: TFormDefaults | null
	onSaved: () => void
}

export function FormDefaultsCard({
	profileId,
	formDefaults,
	onSaved,
}: IFormDefaultsCardProps) {
	const [howDidYouHear, setHowDidYouHear] = useState(
		formDefaults?.howDidYouHear ?? "",
	)
	const [referredByEmployee, setReferredByEmployee] = useState(
		formDefaults?.referredByEmployee ?? "No",
	)
	const [nonCompeteAgreement, setNonCompeteAgreement] = useState(
		formDefaults?.nonCompeteAgreement ?? "No",
	)
	const [previouslyEmployed, setPreviouslyEmployed] = useState(
		formDefaults?.previouslyEmployed ?? "No",
	)
	const [professionalReferences, setProfessionalReferences] = useState(
		formDefaults?.professionalReferences ?? "",
	)
	const [employmentType, setEmploymentType] = useState(
		formDefaults?.employmentType ?? "Full-Time",
	)

	const { execute, result, status } = useAction(updateFormDefaultsAction, {
		onSuccess: () => {
			toast.success("Saved!")
			onSaved()
		},
	})
	const error = useActionError(result)
	useToastOnError(error, status)
	const isLoading = useIsLoading(status)

	const handleSave = () => {
		execute({
			userProfileId: profileId,
			howDidYouHear,
			referredByEmployee,
			nonCompeteAgreement,
			previouslyEmployed,
			professionalReferences,
			employmentType,
		})
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Form Defaults</CardTitle>
				<CardDescription>
					Default values for job application forms.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<YStack className="gap-4">
					<InputGroup>
						<Label htmlFor="fd-how-did-you-hear">
							How Did You Hear
						</Label>
						<Input
							id="fd-how-did-you-hear"
							value={howDidYouHear}
							onChange={(e) => setHowDidYouHear(e.target.value)}
						/>
					</InputGroup>

					<InputGroup>
						<Label htmlFor="fd-referred-by-employee">
							Referred By Employee
						</Label>
						<Input
							id="fd-referred-by-employee"
							value={referredByEmployee}
							onChange={(e) =>
								setReferredByEmployee(e.target.value)
							}
						/>
					</InputGroup>

					<InputGroup>
						<Label htmlFor="fd-non-compete-agreement">
							Non-Compete Agreement
						</Label>
						<Input
							id="fd-non-compete-agreement"
							value={nonCompeteAgreement}
							onChange={(e) =>
								setNonCompeteAgreement(e.target.value)
							}
						/>
					</InputGroup>

					<InputGroup>
						<Label htmlFor="fd-previously-employed">
							Previously Employed
						</Label>
						<Input
							id="fd-previously-employed"
							value={previouslyEmployed}
							onChange={(e) =>
								setPreviouslyEmployed(e.target.value)
							}
						/>
					</InputGroup>

					<InputGroup>
						<Label htmlFor="fd-professional-references">
							Professional References
						</Label>
						<Textarea
							id="fd-professional-references"
							value={professionalReferences}
							onChange={(
								e: React.ChangeEvent<HTMLTextAreaElement>,
							) => setProfessionalReferences(e.target.value)}
						/>
					</InputGroup>

					<InputGroup>
						<Label htmlFor="fd-employment-type">
							Employment Type
						</Label>
						<Input
							id="fd-employment-type"
							value={employmentType}
							onChange={(e) => setEmploymentType(e.target.value)}
						/>
					</InputGroup>
				</YStack>
			</CardContent>
			<CardFooter>
				<Button onClick={handleSave} disabled={isLoading}>
					{isLoading ? "Saving..." : "Save"}
				</Button>
			</CardFooter>
		</Card>
	)
}
