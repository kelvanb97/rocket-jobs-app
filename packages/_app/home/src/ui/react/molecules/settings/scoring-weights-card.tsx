"use client"

import type {
	TScoringConfig,
	TScoringWeight,
} from "@rja-api/settings/schema/scoring-config-schema"
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
import { InputGroup } from "@rja-design/ui/library/input-group"
import { Label } from "@rja-design/ui/library/label"
import { Select } from "@rja-design/ui/library/select"
import { toast } from "@rja-design/ui/library/toast"
import { YStack } from "@rja-design/ui/primitives/y-stack"
import { updateScoringConfigAction } from "#actions/settings-actions"
import { useState } from "react"

const WEIGHT_OPTIONS: { label: string; value: TScoringWeight }[] = [
	{ label: "High", value: "high" },
	{ label: "Medium", value: "medium" },
	{ label: "Low", value: "low" },
]

interface IScoringWeightsCardProps {
	profileId: number
	scoring: TScoringConfig | null
	onSaved: () => void
}

export function ScoringWeightsCard({
	profileId,
	scoring,
	onSaved,
}: IScoringWeightsCardProps) {
	const [titleAndSeniority, setTitleAndSeniority] = useState<TScoringWeight>(
		(scoring?.titleAndSeniority as TScoringWeight) ?? "high",
	)
	const [skills, setSkills] = useState<TScoringWeight>(
		(scoring?.skills as TScoringWeight) ?? "high",
	)
	const [salary, setSalary] = useState<TScoringWeight>(
		(scoring?.salary as TScoringWeight) ?? "high",
	)
	const [location, setLocation] = useState<TScoringWeight>(
		(scoring?.location as TScoringWeight) ?? "medium",
	)
	const [industry, setIndustry] = useState<TScoringWeight>(
		(scoring?.industry as TScoringWeight) ?? "low",
	)

	const { execute, result, status } = useAction(updateScoringConfigAction, {
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
			titleAndSeniority,
			skills,
			salary,
			location,
			industry,
		})
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Scoring Weights</CardTitle>
				<CardDescription>
					Weight configuration for AI role scoring.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<YStack className="gap-4">
					<InputGroup>
						<Label>Title & Seniority</Label>
						<Select
							value={titleAndSeniority}
							onValueChange={setTitleAndSeniority}
							options={WEIGHT_OPTIONS}
						/>
					</InputGroup>

					<InputGroup>
						<Label>Skills</Label>
						<Select
							value={skills}
							onValueChange={setSkills}
							options={WEIGHT_OPTIONS}
						/>
					</InputGroup>

					<InputGroup>
						<Label>Salary</Label>
						<Select
							value={salary}
							onValueChange={setSalary}
							options={WEIGHT_OPTIONS}
						/>
					</InputGroup>

					<InputGroup>
						<Label>Location</Label>
						<Select
							value={location}
							onValueChange={setLocation}
							options={WEIGHT_OPTIONS}
						/>
					</InputGroup>

					<InputGroup>
						<Label>Industry</Label>
						<Select
							value={industry}
							onValueChange={setIndustry}
							options={WEIGHT_OPTIONS}
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
