"use client"

import type { TEeoConfig } from "@rja-api/settings/schema/eeo-config-schema"
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
import { Switch } from "@rja-design/ui/library/switch"
import { toast } from "@rja-design/ui/library/toast"
import { YStack } from "@rja-design/ui/primitives/y-stack"
import { updateEeoAction } from "#actions/settings-actions"
import { useState } from "react"

interface IEeoCardProps {
	profileId: number
	eeo: TEeoConfig | null
	onSaved: () => void
}

export function EeoCard({ profileId, eeo, onSaved }: IEeoCardProps) {
	const [gender, setGender] = useState(eeo?.gender ?? "")
	const [ethnicity, setEthnicity] = useState(eeo?.ethnicity ?? "")
	const [veteranStatus, setVeteranStatus] = useState(eeo?.veteranStatus ?? "")
	const [disabilityStatus, setDisabilityStatus] = useState(
		eeo?.disabilityStatus ?? "",
	)
	const [workAuthorization, setWorkAuthorization] = useState(
		eeo?.workAuthorization ?? "",
	)
	const [requiresVisaSponsorship, setRequiresVisaSponsorship] = useState(
		eeo?.requiresVisaSponsorship ?? false,
	)

	const { execute, result, status } = useAction(updateEeoAction, {
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
			gender: gender || null,
			ethnicity: ethnicity || null,
			veteranStatus: veteranStatus || null,
			disabilityStatus: disabilityStatus || null,
			workAuthorization: workAuthorization || null,
			requiresVisaSponsorship,
		})
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>EEO & Work Authorization</CardTitle>
				<CardDescription>
					Equal Employment Opportunity and work authorization
					settings.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<YStack className="gap-4">
					<InputGroup>
						<Label htmlFor="eeo-gender">Gender</Label>
						<Input
							id="eeo-gender"
							value={gender}
							onChange={(e) => setGender(e.target.value)}
							placeholder="Leave empty to decline"
						/>
					</InputGroup>

					<InputGroup>
						<Label htmlFor="eeo-ethnicity">Ethnicity</Label>
						<Input
							id="eeo-ethnicity"
							value={ethnicity}
							onChange={(e) => setEthnicity(e.target.value)}
							placeholder="Leave empty to decline"
						/>
					</InputGroup>

					<InputGroup>
						<Label htmlFor="eeo-veteran-status">
							Veteran Status
						</Label>
						<Input
							id="eeo-veteran-status"
							value={veteranStatus}
							onChange={(e) => setVeteranStatus(e.target.value)}
							placeholder="Leave empty to decline"
						/>
					</InputGroup>

					<InputGroup>
						<Label htmlFor="eeo-disability-status">
							Disability Status
						</Label>
						<Input
							id="eeo-disability-status"
							value={disabilityStatus}
							onChange={(e) =>
								setDisabilityStatus(e.target.value)
							}
							placeholder="Leave empty to decline"
						/>
					</InputGroup>

					<InputGroup>
						<Label htmlFor="eeo-work-authorization">
							Work Authorization
						</Label>
						<Input
							id="eeo-work-authorization"
							value={workAuthorization}
							onChange={(e) =>
								setWorkAuthorization(e.target.value)
							}
							placeholder="Leave empty to decline"
						/>
					</InputGroup>

					<Switch
						checked={requiresVisaSponsorship}
						onCheckedChange={setRequiresVisaSponsorship}
						rightLabel="Requires Visa Sponsorship"
					/>
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
