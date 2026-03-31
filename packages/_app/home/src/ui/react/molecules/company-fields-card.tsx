import {
	COMPANY_SIZES,
	COMPANY_STAGES,
} from "@rja-api/company/schema/company-schema"
import {
	Card,
	CardContent,
	CardDescription,
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

export interface ICompanyFieldsValues {
	name: string
	website: string
	linkedinUrl: string
	size: string
	stage: string
	industry: string
	notes: string
}

const SIZE_OPTIONS = COMPANY_SIZES.map((s) => ({ label: s, value: s }))

const STAGE_OPTIONS = COMPANY_STAGES.map((s) => ({ label: s, value: s }))

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
							onChange={(e) => update("industry", e.target.value)}
							placeholder="e.g. Fintech, Healthcare"
						/>
					</InputGroup>

					<InputGroup>
						<Label htmlFor="company-notes">Notes</Label>
						<Textarea
							id="company-notes"
							value={values.notes}
							onChange={(
								e: React.ChangeEvent<HTMLTextAreaElement>,
							) => update("notes", e.target.value)}
							placeholder="Any notes about the company..."
						/>
					</InputGroup>
				</YStack>
			</CardContent>
		</Card>
	)
}
