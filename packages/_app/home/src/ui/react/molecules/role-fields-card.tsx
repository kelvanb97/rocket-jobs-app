import {
	type TLocationType,
	type TRoleSource,
} from "@rja-api/role/schema/role-schema"
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@rja-design/ui/library/card"
import { Input } from "@rja-design/ui/library/input"
import { InputGroup } from "@rja-design/ui/library/input-group"
import { Label } from "@rja-design/ui/library/label"
import { Select } from "@rja-design/ui/library/select"
import { Textarea } from "@rja-design/ui/library/text-area"
import { XStack } from "@rja-design/ui/primitives/x-stack"
import { YStack } from "@rja-design/ui/primitives/y-stack"

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

const LOCATION_TYPE_OPTIONS: { label: string; value: TLocationType }[] = [
	{ label: "Remote", value: "remote" },
	{ label: "Hybrid", value: "hybrid" },
	{ label: "On-site", value: "on-site" },
]

const SOURCE_OPTIONS: { label: string; value: TRoleSource }[] = [
	{ label: "LinkedIn", value: "linkedin" },
	{ label: "Google Jobs", value: "google-jobs" },
	{ label: "Himalayas", value: "himalayas" },
	{ label: "Jobicy", value: "jobicy" },
	{ label: "Remote OK", value: "remoteok" },
	{ label: "We Work Remotely", value: "weworkremotely" },
	{ label: "Indeed", value: "indeed" },
	{ label: "Company Website", value: "company-website" },
	{ label: "Referral", value: "referral" },
	{ label: "Recruiter", value: "recruiter" },
	{ label: "Other", value: "other" },
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
							onChange={(
								e: React.ChangeEvent<HTMLTextAreaElement>,
							) => update("description", e.target.value)}
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
							onChange={(e) => update("location", e.target.value)}
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
							onChange={(
								e: React.ChangeEvent<HTMLTextAreaElement>,
							) => update("notes", e.target.value)}
							placeholder="Any notes about the role..."
						/>
					</InputGroup>
				</YStack>
			</CardContent>
		</Card>
	)
}
