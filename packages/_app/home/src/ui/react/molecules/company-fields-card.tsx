import {
	Card,
	CardContent,
	CardDescription,
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

export interface ICompanyFieldsValues {
	name: string
	website: string
	linkedinUrl: string
	size: string
	stage: string
	industry: string
	notes: string
}

const SIZE_OPTIONS = [
	{ label: "1-10", value: "1-10" },
	{ label: "11-50", value: "11-50" },
	{ label: "51-200", value: "51-200" },
	{ label: "201-500", value: "201-500" },
	{ label: "501-1000", value: "501-1000" },
	{ label: "1001-5000", value: "1001-5000" },
	{ label: "5000+", value: "5000+" },
]

const STAGE_OPTIONS = [
	{ label: "Seed", value: "Seed" },
	{ label: "Series A", value: "Series A" },
	{ label: "Series B", value: "Series B" },
	{ label: "Series C+", value: "Series C+" },
	{ label: "Public", value: "Public" },
	{ label: "Bootstrapped", value: "Bootstrapped" },
]

interface ICompanyFieldsCardProps {
	values: ICompanyFieldsValues
	onChange: (values: ICompanyFieldsValues) => void
}

export function CompanyFieldsCard({
	values,
	onChange,
}: ICompanyFieldsCardProps) {
	const update = (field: keyof ICompanyFieldsValues, value: string) => {
		onChange({ ...values, [field]: value })
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Company</CardTitle>
				<CardDescription>
					Optional — leave name empty to skip.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<YStack className="gap-4">
					<InputGroup>
						<Label htmlFor="company-name" showRequiredIcon>
							Name
						</Label>
						<Input
							id="company-name"
							value={values.name}
							onChange={(e) => update("name", e.target.value)}
							placeholder="Acme Corp"
						/>
					</InputGroup>

					<XStack className="gap-4">
						<InputGroup className="flex-1">
							<Label htmlFor="company-website">Website</Label>
							<Input
								id="company-website"
								value={values.website}
								onChange={(e) =>
									update("website", e.target.value)
								}
								placeholder="https://example.com"
							/>
						</InputGroup>
						<InputGroup className="flex-1">
							<Label htmlFor="company-linkedin">
								LinkedIn URL
							</Label>
							<Input
								id="company-linkedin"
								value={values.linkedinUrl}
								onChange={(e) =>
									update("linkedinUrl", e.target.value)
								}
								placeholder="https://linkedin.com/company/..."
							/>
						</InputGroup>
					</XStack>

					<XStack className="gap-4">
						<InputGroup className="flex-1">
							<Label htmlFor="company-size">Size</Label>
							<Select
								value={values.size || null}
								onValueChange={(val) => update("size", val)}
								options={SIZE_OPTIONS}
								placeholder="Select size"
							/>
						</InputGroup>
						<InputGroup className="flex-1">
							<Label htmlFor="company-stage">Stage</Label>
							<Select
								value={values.stage || null}
								onValueChange={(val) => update("stage", val)}
								options={STAGE_OPTIONS}
								placeholder="Select stage"
							/>
						</InputGroup>
					</XStack>

					<InputGroup>
						<Label htmlFor="company-industry">Industry</Label>
						<Input
							id="company-industry"
							value={values.industry}
							onChange={(e) =>
								update("industry", e.target.value)
							}
							placeholder="e.g. Fintech, Healthcare"
						/>
					</InputGroup>

					<InputGroup>
						<Label htmlFor="company-notes">Notes</Label>
						<Textarea
							id="company-notes"
							value={values.notes}
							onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => update("notes", e.target.value)}
							placeholder="Any notes about the company..."
						/>
					</InputGroup>
				</YStack>
			</CardContent>
		</Card>
	)
}
