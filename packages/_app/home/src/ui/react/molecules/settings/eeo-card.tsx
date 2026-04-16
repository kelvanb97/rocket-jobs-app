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
import { InputLabelWrapper } from "@rja-design/ui/library/input-label-wrapper"
import { Label } from "@rja-design/ui/library/label"
import { Select } from "@rja-design/ui/library/select"
import { Switch } from "@rja-design/ui/library/switch"
import { toast } from "@rja-design/ui/library/toast"
import { Tooltip } from "@rja-design/ui/library/tooltip"
import { YStack } from "@rja-design/ui/primitives/y-stack"
import { updateEeoAction } from "#actions/settings-actions"
import { useState } from "react"

const VETERAN_STATUS_OPTIONS = [
	{
		label: "I am not a protected veteran",
		value: "I am not a protected veteran",
	},
	{ label: "I am a protected veteran", value: "I am a protected veteran" },
	{ label: "Decline to self-identify", value: "Decline to self-identify" },
]

const DISABILITY_STATUS_OPTIONS = [
	{
		label: "No, I don't have a disability",
		value: "No, I don't have a disability",
	},
	{ label: "Yes, I have a disability", value: "Yes, I have a disability" },
	{ label: "Decline to self-identify", value: "Decline to self-identify" },
]

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
					<InputLabelWrapper>
						<Label htmlFor="eeo-gender">Gender</Label>
						<Input
							id="eeo-gender"
							value={gender}
							onChange={(e) => setGender(e.target.value)}
							placeholder="Leave empty to decline"
						/>
					</InputLabelWrapper>

					<InputLabelWrapper>
						<Label htmlFor="eeo-ethnicity">Ethnicity</Label>
						<Input
							id="eeo-ethnicity"
							value={ethnicity}
							onChange={(e) => setEthnicity(e.target.value)}
							placeholder="Leave empty to decline"
						/>
					</InputLabelWrapper>

					<InputLabelWrapper>
						<Label>Veteran Status</Label>
						<Select
							value={veteranStatus || null}
							onValueChange={setVeteranStatus}
							options={VETERAN_STATUS_OPTIONS}
							placeholder="Select veteran status"
						/>
					</InputLabelWrapper>

					<InputLabelWrapper>
						<Label>Disability Status</Label>
						<Select
							value={disabilityStatus || null}
							onValueChange={setDisabilityStatus}
							options={DISABILITY_STATUS_OPTIONS}
							placeholder="Select disability status"
						/>
					</InputLabelWrapper>

					<InputLabelWrapper>
						<Label htmlFor="eeo-work-authorization">
							Work Authorization
							<Tooltip
								iconClassName="size-3.5 text-muted-foreground"
								content="Country or region where you are authorized to work (e.g. United States, European Union, Canada, United Kingdom)."
							/>
						</Label>
						<Input
							id="eeo-work-authorization"
							value={workAuthorization}
							onChange={(e) =>
								setWorkAuthorization(e.target.value)
							}
							placeholder="e.g. United States"
						/>
					</InputLabelWrapper>

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
