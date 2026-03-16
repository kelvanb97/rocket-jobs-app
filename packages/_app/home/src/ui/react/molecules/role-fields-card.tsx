import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@aja-design/ui/library/card"
import { Input } from "@aja-design/ui/library/input"
import { InputGroup } from "@aja-design/ui/library/input-group"
import { Label } from "@aja-design/ui/library/label"
import { Select } from "@aja-design/ui/library/select"
import { Textarea } from "@aja-design/ui/library/text-area"
import { XStack } from "@aja-design/ui/primitives/x-stack"
import { YStack } from "@aja-design/ui/primitives/y-stack"

export interface IRoleFieldsValues {
	title: string
	url: string
	description: string
	source: string
	locationType: string
	location: string
	salaryMin: string
	salaryMax: string
	notes: string
}

const SOURCE_OPTIONS = [
	{ label: "LinkedIn", value: "LinkedIn" },
	{ label: "Indeed", value: "Indeed" },
	{ label: "Company Website", value: "Company Website" },
	{ label: "Referral", value: "Referral" },
	{ label: "Recruiter", value: "Recruiter" },
	{ label: "Other", value: "Other" },
]

const LOCATION_TYPE_OPTIONS = [
	{ label: "Remote", value: "Remote" },
	{ label: "Hybrid", value: "Hybrid" },
	{ label: "On-site", value: "On-site" },
]

interface IRoleFieldsCardProps {
	values: IRoleFieldsValues
	onChange: (values: IRoleFieldsValues) => void
}

export function RoleFieldsCard({ values, onChange }: IRoleFieldsCardProps) {
	const update = (field: keyof IRoleFieldsValues, value: string) => {
		onChange({ ...values, [field]: value })
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Role</CardTitle>
			</CardHeader>
			<CardContent>
				<YStack className="gap-4">
					<InputGroup>
						<Label htmlFor="role-title" showRequiredIcon>
							Title
						</Label>
						<Input
							id="role-title"
							value={values.title}
							onChange={(e) => update("title", e.target.value)}
							placeholder="Senior Software Engineer"
						/>
					</InputGroup>

					<InputGroup>
						<Label htmlFor="role-url">URL</Label>
						<Input
							id="role-url"
							value={values.url}
							onChange={(e) => update("url", e.target.value)}
							placeholder="https://..."
						/>
					</InputGroup>

					<InputGroup>
						<Label htmlFor="role-description">Description</Label>
						<Textarea
							id="role-description"
							value={values.description}
							onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
								update("description", e.target.value)
							}
							placeholder="Job description..."
						/>
					</InputGroup>

					<XStack className="gap-4">
						<InputGroup className="flex-1">
							<Label htmlFor="role-source">Source</Label>
							<Select
								value={values.source || null}
								onValueChange={(val) => update("source", val)}
								options={SOURCE_OPTIONS}
								placeholder="Select source"
							/>
						</InputGroup>
						<InputGroup className="flex-1">
							<Label htmlFor="role-location-type">
								Location Type
							</Label>
							<Select
								value={values.locationType || null}
								onValueChange={(val) =>
									update("locationType", val)
								}
								options={LOCATION_TYPE_OPTIONS}
								placeholder="Select type"
							/>
						</InputGroup>
					</XStack>

					<InputGroup>
						<Label htmlFor="role-location">Location</Label>
						<Input
							id="role-location"
							value={values.location}
							onChange={(e) =>
								update("location", e.target.value)
							}
							placeholder="San Francisco, CA"
						/>
					</InputGroup>

					<XStack className="gap-4">
						<InputGroup className="flex-1">
							<Label htmlFor="role-salary-min">Salary Min</Label>
							<Input
								id="role-salary-min"
								type="number"
								value={values.salaryMin}
								onChange={(e) =>
									update("salaryMin", e.target.value)
								}
								placeholder="80000"
							/>
						</InputGroup>
						<InputGroup className="flex-1">
							<Label htmlFor="role-salary-max">Salary Max</Label>
							<Input
								id="role-salary-max"
								type="number"
								value={values.salaryMax}
								onChange={(e) =>
									update("salaryMax", e.target.value)
								}
								placeholder="120000"
							/>
						</InputGroup>
					</XStack>

					<InputGroup>
						<Label htmlFor="role-notes">Notes</Label>
						<Textarea
							id="role-notes"
							value={values.notes}
							onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => update("notes", e.target.value)}
							placeholder="Any notes about the role..."
						/>
					</InputGroup>
				</YStack>
			</CardContent>
		</Card>
	)
}
