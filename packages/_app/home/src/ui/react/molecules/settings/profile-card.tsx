"use client"

import {
	LOCATION_TYPES,
	type TLocationType,
	type TSeniority,
	type TUserProfile,
	type TUserProfileFull,
} from "@rja-api/settings/schema/user-profile-schema"
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
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@rja-design/ui/library/input-group"
import { InputLabelWrapper } from "@rja-design/ui/library/input-label-wrapper"
import { Label } from "@rja-design/ui/library/label"
import { MultiInput } from "@rja-design/ui/library/multi-input"
import { MultiSelect } from "@rja-design/ui/library/multi-select"
import { Select } from "@rja-design/ui/library/select"
import { Textarea } from "@rja-design/ui/library/text-area"
import { toast } from "@rja-design/ui/library/toast"
import { Tooltip } from "@rja-design/ui/library/tooltip"
import { XStack } from "@rja-design/ui/primitives/x-stack"
import { YStack } from "@rja-design/ui/primitives/y-stack"
import { updateProfileAction } from "#actions/settings-actions"
import { useState } from "react"

function formatCurrency(value: number): string {
	if (!value) return ""
	return value.toLocaleString("en-US")
}

function parseCurrency(formatted: string): number {
	const digits = formatted.replace(/\D/g, "")
	return digits ? Number(digits) : 0
}

const SENIORITY_OPTIONS = [
	{ label: "Junior", value: "junior" },
	{ label: "Mid", value: "mid" },
	{ label: "Senior", value: "senior" },
	{ label: "Staff", value: "staff" },
	{ label: "Principal", value: "principal" },
	{ label: "Director", value: "director" },
]

const YEARS_OF_EXPERIENCE_OPTIONS = Array.from({ length: 51 }, (_, i) => ({
	label: i === 50 ? "50+ years" : i === 1 ? "1 year" : `${i} years`,
	value: String(i),
}))

const LOCATION_TYPE_LABELS: Record<TLocationType, string> = {
	remote: "Remote",
	hybrid: "Hybrid",
	"on-site": "On-site",
}

const LOCATION_TYPE_OPTIONS = LOCATION_TYPES.map((value) => ({
	label: LOCATION_TYPE_LABELS[value],
	value,
}))

interface IProfileCardProps {
	profile: TUserProfileFull | null
	onSaved: (data: TUserProfile) => void
}

export function ProfileCard({ profile, onSaved }: IProfileCardProps) {
	const [name, setName] = useState(profile?.name ?? "")
	const [email, setEmail] = useState(profile?.email ?? "")
	const [phone, setPhone] = useState(profile?.phone ?? "")
	const [linkedin, setLinkedin] = useState(profile?.linkedin ?? "")
	const [github, setGithub] = useState(profile?.github ?? "")
	const [personalWebsite, setPersonalWebsite] = useState(
		profile?.personalWebsite ?? "",
	)
	const [location, setLocation] = useState(profile?.location ?? "")
	const [address, setAddress] = useState(profile?.address ?? "")
	const [jobTitle, setJobTitle] = useState(profile?.jobTitle ?? "")
	const [seniority, setSeniority] = useState<TSeniority>(
		(profile?.seniority as TSeniority) ?? "mid",
	)
	const [yearsOfExperience, setYearsOfExperience] = useState(
		profile?.yearsOfExperience ?? 0,
	)
	const [summary, setSummary] = useState(profile?.summary ?? "")
	const [skills, setSkills] = useState(profile?.skills ?? [])
	const [domainExpertise, setDomainExpertise] = useState(
		profile?.domainExpertise ?? [],
	)
	const [preferredLocationTypes, setPreferredLocationTypes] = useState<
		TLocationType[]
	>((profile?.preferredLocationTypes ?? []) as TLocationType[])
	const [preferredLocations, setPreferredLocations] = useState(
		profile?.preferredLocations ?? [],
	)
	const [salaryMin, setSalaryMin] = useState(profile?.salaryMin ?? 0)
	const [salaryMax, setSalaryMax] = useState(profile?.salaryMax ?? 0)
	const [desiredSalary, setDesiredSalary] = useState(
		profile?.desiredSalary ?? 0,
	)
	const [startDateWeeksOut, setStartDateWeeksOut] = useState(
		profile?.startDateWeeksOut ?? 2,
	)
	const [industries, setIndustries] = useState(profile?.industries ?? [])
	const [dealbreakers, setDealbreakers] = useState(
		profile?.dealbreakers ?? [],
	)

	const { execute, result, status } = useAction(updateProfileAction, {
		onSuccess: ({ data }) => {
			if (data) {
				toast.success("Profile saved!")
				onSaved(data)
			}
		},
	})
	const error = useActionError(result)
	useToastOnError(error, status)
	const isLoading = useIsLoading(status)

	const handleSave = () => {
		execute({
			id: profile?.id,
			name,
			email,
			phone,
			linkedin,
			github,
			personalWebsite,
			location,
			address,
			jobTitle,
			seniority,
			yearsOfExperience,
			summary,
			skills,
			domainExpertise,
			preferredLocationTypes,
			preferredLocations,
			salaryMin,
			salaryMax,
			desiredSalary,
			startDateWeeksOut,
			industries,
			dealbreakers,
		})
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Profile</CardTitle>
				<CardDescription>
					Your personal and professional information used for
					applications.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<YStack className="gap-6">
					<h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
						Contact Info
					</h3>
					<XStack className="gap-4">
						<InputLabelWrapper className="flex-1">
							<Label htmlFor="profile-name">Name</Label>
							<Input
								id="profile-name"
								value={name}
								onChange={(e) => setName(e.target.value)}
							/>
						</InputLabelWrapper>
						<InputLabelWrapper className="flex-1">
							<Label htmlFor="profile-email">Email</Label>
							<Input
								id="profile-email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
							/>
						</InputLabelWrapper>
					</XStack>
					<XStack className="gap-4">
						<InputLabelWrapper className="flex-1">
							<Label htmlFor="profile-phone">Phone</Label>
							<Input
								id="profile-phone"
								value={phone}
								onChange={(e) => setPhone(e.target.value)}
							/>
						</InputLabelWrapper>
						<InputLabelWrapper className="flex-1">
							<Label htmlFor="profile-linkedin">LinkedIn</Label>
							<Input
								id="profile-linkedin"
								value={linkedin}
								onChange={(e) => setLinkedin(e.target.value)}
							/>
						</InputLabelWrapper>
					</XStack>
					<XStack className="gap-4">
						<InputLabelWrapper className="flex-1">
							<Label htmlFor="profile-github">GitHub</Label>
							<Input
								id="profile-github"
								value={github}
								onChange={(e) => setGithub(e.target.value)}
							/>
						</InputLabelWrapper>
						<InputLabelWrapper className="flex-1">
							<Label htmlFor="profile-personal-website">
								Personal Website
							</Label>
							<Input
								id="profile-personal-website"
								value={personalWebsite}
								onChange={(e) =>
									setPersonalWebsite(e.target.value)
								}
							/>
						</InputLabelWrapper>
					</XStack>
					<XStack className="gap-4">
						<InputLabelWrapper className="flex-1">
							<Label htmlFor="profile-location">Location</Label>
							<Input
								id="profile-location"
								value={location}
								onChange={(e) => setLocation(e.target.value)}
							/>
						</InputLabelWrapper>
						<InputLabelWrapper className="flex-1">
							<Label htmlFor="profile-address">Address</Label>
							<Input
								id="profile-address"
								value={address}
								onChange={(e) => setAddress(e.target.value)}
							/>
						</InputLabelWrapper>
					</XStack>

					<h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
						Career
					</h3>
					<XStack className="gap-4">
						<InputLabelWrapper className="flex-1">
							<Label htmlFor="profile-job-title">Job Title</Label>
							<Input
								id="profile-job-title"
								value={jobTitle}
								onChange={(e) => setJobTitle(e.target.value)}
							/>
						</InputLabelWrapper>
						<InputLabelWrapper className="flex-1">
							<Label htmlFor="profile-seniority">Seniority</Label>
							<Select
								value={seniority || null}
								onValueChange={(val) =>
									setSeniority(val as TSeniority)
								}
								options={SENIORITY_OPTIONS}
								placeholder="Select seniority"
							/>
						</InputLabelWrapper>
						<InputLabelWrapper className="flex-1">
							<Label htmlFor="profile-yoe">
								Years of Experience
							</Label>
							<Select
								value={String(yearsOfExperience)}
								onValueChange={(val) =>
									setYearsOfExperience(Number(val))
								}
								options={YEARS_OF_EXPERIENCE_OPTIONS}
								placeholder="Select years"
							/>
						</InputLabelWrapper>
					</XStack>

					<h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
						Summary
					</h3>
					<InputLabelWrapper>
						<Label htmlFor="profile-summary">Summary</Label>
						<Textarea
							id="profile-summary"
							value={summary}
							onChange={(
								e: React.ChangeEvent<HTMLTextAreaElement>,
							) => setSummary(e.target.value)}
						/>
					</InputLabelWrapper>

					<h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
						Skills & Expertise
					</h3>
					<InputLabelWrapper>
						<Label>Skills</Label>
						<MultiInput
							values={skills}
							onChange={(vals) => setSkills(vals)}
							max={100}
						/>
					</InputLabelWrapper>
					<InputLabelWrapper>
						<Label>
							Domain Expertise
							<Tooltip
								iconClassName="size-3.5 text-muted-foreground"
								content="Industries or domains you have worked in (e.g. fintech, healthcare, e-commerce). Used by the LLM to gauge industry fit when scoring roles and tailoring resumes."
							/>
						</Label>
						<MultiInput
							values={domainExpertise}
							onChange={(vals) => setDomainExpertise(vals)}
							max={20}
							placeholder="Fintech, Healthcare, e-commerce, etc."
						/>
					</InputLabelWrapper>

					<h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
						Preferences
					</h3>
					<InputLabelWrapper>
						<Label>Preferred Location Types</Label>
						<MultiSelect
							values={preferredLocationTypes}
							onValueChange={(vals) =>
								setPreferredLocationTypes(vals)
							}
							options={LOCATION_TYPE_OPTIONS}
							max={LOCATION_TYPE_OPTIONS.length}
							placeholder="Add a location type"
						/>
					</InputLabelWrapper>
					<InputLabelWrapper>
						<Label>Preferred Locations</Label>
						<MultiInput
							values={preferredLocations}
							onChange={(vals) => setPreferredLocations(vals)}
							max={20}
							placeholder="Seattle WA, San Francisco CA, etc."
						/>
					</InputLabelWrapper>
					<XStack className="gap-4">
						<InputLabelWrapper className="flex-1">
							<Label htmlFor="profile-salary-min">
								Salary Min
							</Label>
							<InputGroup>
								<InputGroupAddon>$</InputGroupAddon>
								<InputGroupInput
									id="profile-salary-min"
									inputMode="numeric"
									value={formatCurrency(salaryMin)}
									onChange={(e) =>
										setSalaryMin(
											parseCurrency(e.target.value),
										)
									}
									placeholder="80,000"
								/>
							</InputGroup>
						</InputLabelWrapper>
						<InputLabelWrapper className="flex-1">
							<Label htmlFor="profile-salary-max">
								Salary Max
							</Label>
							<InputGroup>
								<InputGroupAddon>$</InputGroupAddon>
								<InputGroupInput
									id="profile-salary-max"
									inputMode="numeric"
									value={formatCurrency(salaryMax)}
									onChange={(e) =>
										setSalaryMax(
											parseCurrency(e.target.value),
										)
									}
									placeholder="120,000"
								/>
							</InputGroup>
						</InputLabelWrapper>
						<InputLabelWrapper className="flex-1">
							<Label htmlFor="profile-desired-salary">
								Desired Salary
							</Label>
							<InputGroup>
								<InputGroupAddon>$</InputGroupAddon>
								<InputGroupInput
									id="profile-desired-salary"
									inputMode="numeric"
									value={formatCurrency(desiredSalary)}
									onChange={(e) =>
										setDesiredSalary(
											parseCurrency(e.target.value),
										)
									}
									placeholder="100,000"
								/>
							</InputGroup>
						</InputLabelWrapper>
					</XStack>
					<InputLabelWrapper>
						<Label htmlFor="profile-start-date-weeks">
							Start Date (Weeks Out)
						</Label>
						<Input
							id="profile-start-date-weeks"
							type="number"
							value={startDateWeeksOut}
							onChange={(e) =>
								setStartDateWeeksOut(Number(e.target.value))
							}
						/>
					</InputLabelWrapper>
					<InputLabelWrapper>
						<Label>
							Preferred Industries
							<Tooltip
								iconClassName="size-3.5 text-muted-foreground"
								content="Industries you want to work in (e.g. climate tech, gaming, biotech). Used by the LLM to score industry fit on new roles. Different from Domain Expertise, which is what you have actually worked in."
							/>
						</Label>
						<MultiInput
							values={industries}
							onChange={(vals) => setIndustries(vals)}
							max={20}
						/>
					</InputLabelWrapper>
					<InputLabelWrapper>
						<Label>
							Dealbreakers
							<Tooltip
								iconClassName="size-3.5 text-muted-foreground"
								content="Anything you refuse to work with — skills, tools, technologies, industries, company sizes, work styles, etc. (e.g. PHP, defense, on-call, startups under 50). Any match forces the role's score below 20."
							/>
						</Label>
						<MultiInput
							values={dealbreakers}
							onChange={(vals) => setDealbreakers(vals)}
							max={20}
						/>
					</InputLabelWrapper>
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
