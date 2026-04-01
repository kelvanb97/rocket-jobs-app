"use client"

import type {
	TSeniority,
	TUserProfileFull,
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
import { InputGroup } from "@rja-design/ui/library/input-group"
import { Label } from "@rja-design/ui/library/label"
import { MultiInput } from "@rja-design/ui/library/multi-input"
import { Select } from "@rja-design/ui/library/select"
import { Textarea } from "@rja-design/ui/library/text-area"
import { toast } from "@rja-design/ui/library/toast"
import { XStack } from "@rja-design/ui/primitives/x-stack"
import { YStack } from "@rja-design/ui/primitives/y-stack"
import { updateProfileAction } from "#actions/settings-actions"
import { useState } from "react"

const SENIORITY_OPTIONS = [
	{ label: "Junior", value: "junior" },
	{ label: "Mid", value: "mid" },
	{ label: "Senior", value: "senior" },
	{ label: "Staff", value: "staff" },
	{ label: "Principal", value: "principal" },
	{ label: "Director", value: "director" },
]

interface IProfileCardProps {
	profile: TUserProfileFull | null
	onSaved: () => void
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
	const [notes, setNotes] = useState(profile?.notes ?? "")
	const [skills, setSkills] = useState(profile?.skills ?? [])
	const [preferredSkills, setPreferredSkills] = useState(
		profile?.preferredSkills ?? [],
	)
	const [domainExpertise, setDomainExpertise] = useState(
		profile?.domainExpertise ?? [],
	)
	const [preferredLocationTypes, setPreferredLocationTypes] = useState(
		profile?.preferredLocationTypes ?? [],
	)
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
		onSuccess: () => {
			toast.success("Profile saved!")
			onSaved()
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
			notes,
			skills,
			preferredSkills,
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
						<InputGroup className="flex-1">
							<Label htmlFor="profile-name">Name</Label>
							<Input
								id="profile-name"
								value={name}
								onChange={(e) => setName(e.target.value)}
							/>
						</InputGroup>
						<InputGroup className="flex-1">
							<Label htmlFor="profile-email">Email</Label>
							<Input
								id="profile-email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
							/>
						</InputGroup>
					</XStack>
					<XStack className="gap-4">
						<InputGroup className="flex-1">
							<Label htmlFor="profile-phone">Phone</Label>
							<Input
								id="profile-phone"
								value={phone}
								onChange={(e) => setPhone(e.target.value)}
							/>
						</InputGroup>
						<InputGroup className="flex-1">
							<Label htmlFor="profile-linkedin">LinkedIn</Label>
							<Input
								id="profile-linkedin"
								value={linkedin}
								onChange={(e) => setLinkedin(e.target.value)}
							/>
						</InputGroup>
					</XStack>
					<XStack className="gap-4">
						<InputGroup className="flex-1">
							<Label htmlFor="profile-github">GitHub</Label>
							<Input
								id="profile-github"
								value={github}
								onChange={(e) => setGithub(e.target.value)}
							/>
						</InputGroup>
						<InputGroup className="flex-1">
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
						</InputGroup>
					</XStack>
					<XStack className="gap-4">
						<InputGroup className="flex-1">
							<Label htmlFor="profile-location">Location</Label>
							<Input
								id="profile-location"
								value={location}
								onChange={(e) => setLocation(e.target.value)}
							/>
						</InputGroup>
						<InputGroup className="flex-1">
							<Label htmlFor="profile-address">Address</Label>
							<Input
								id="profile-address"
								value={address}
								onChange={(e) => setAddress(e.target.value)}
							/>
						</InputGroup>
					</XStack>

					<h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
						Career
					</h3>
					<XStack className="gap-4">
						<InputGroup className="flex-1">
							<Label htmlFor="profile-job-title">Job Title</Label>
							<Input
								id="profile-job-title"
								value={jobTitle}
								onChange={(e) => setJobTitle(e.target.value)}
							/>
						</InputGroup>
						<InputGroup className="flex-1">
							<Label htmlFor="profile-seniority">Seniority</Label>
							<Select
								value={seniority || null}
								onValueChange={(val) =>
									setSeniority(val as TSeniority)
								}
								options={SENIORITY_OPTIONS}
								placeholder="Select seniority"
							/>
						</InputGroup>
						<InputGroup className="flex-1">
							<Label htmlFor="profile-yoe">
								Years of Experience
							</Label>
							<Input
								id="profile-yoe"
								type="number"
								value={yearsOfExperience}
								onChange={(e) =>
									setYearsOfExperience(Number(e.target.value))
								}
							/>
						</InputGroup>
					</XStack>

					<h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
						Summary & Notes
					</h3>
					<InputGroup>
						<Label htmlFor="profile-summary">Summary</Label>
						<Textarea
							id="profile-summary"
							value={summary}
							onChange={(
								e: React.ChangeEvent<HTMLTextAreaElement>,
							) => setSummary(e.target.value)}
						/>
					</InputGroup>
					<InputGroup>
						<Label htmlFor="profile-notes">Notes</Label>
						<Textarea
							id="profile-notes"
							value={notes}
							onChange={(
								e: React.ChangeEvent<HTMLTextAreaElement>,
							) => setNotes(e.target.value)}
						/>
					</InputGroup>

					<h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
						Skills & Expertise
					</h3>
					<InputGroup>
						<Label>Skills</Label>
						<MultiInput
							values={skills}
							onChange={(vals) => setSkills(vals)}
							max={100}
						/>
					</InputGroup>
					<InputGroup>
						<Label>Preferred Skills</Label>
						<MultiInput
							values={preferredSkills}
							onChange={(vals) => setPreferredSkills(vals)}
							max={20}
						/>
					</InputGroup>
					<InputGroup>
						<Label>Domain Expertise</Label>
						<MultiInput
							values={domainExpertise}
							onChange={(vals) => setDomainExpertise(vals)}
							max={20}
						/>
					</InputGroup>

					<h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
						Preferences
					</h3>
					<InputGroup>
						<Label>Preferred Location Types</Label>
						<MultiInput
							values={preferredLocationTypes}
							onChange={(vals) => setPreferredLocationTypes(vals)}
							max={3}
						/>
					</InputGroup>
					<InputGroup>
						<Label>Preferred Locations</Label>
						<MultiInput
							values={preferredLocations}
							onChange={(vals) => setPreferredLocations(vals)}
							max={20}
						/>
					</InputGroup>
					<XStack className="gap-4">
						<InputGroup className="flex-1">
							<Label htmlFor="profile-salary-min">
								Salary Min
							</Label>
							<Input
								id="profile-salary-min"
								type="number"
								value={salaryMin}
								onChange={(e) =>
									setSalaryMin(Number(e.target.value))
								}
							/>
						</InputGroup>
						<InputGroup className="flex-1">
							<Label htmlFor="profile-salary-max">
								Salary Max
							</Label>
							<Input
								id="profile-salary-max"
								type="number"
								value={salaryMax}
								onChange={(e) =>
									setSalaryMax(Number(e.target.value))
								}
							/>
						</InputGroup>
						<InputGroup className="flex-1">
							<Label htmlFor="profile-desired-salary">
								Desired Salary
							</Label>
							<Input
								id="profile-desired-salary"
								type="number"
								value={desiredSalary}
								onChange={(e) =>
									setDesiredSalary(Number(e.target.value))
								}
							/>
						</InputGroup>
					</XStack>
					<InputGroup>
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
					</InputGroup>
					<InputGroup>
						<Label>Industries</Label>
						<MultiInput
							values={industries}
							onChange={(vals) => setIndustries(vals)}
							max={20}
						/>
					</InputGroup>
					<InputGroup>
						<Label>Dealbreakers</Label>
						<MultiInput
							values={dealbreakers}
							onChange={(vals) => setDealbreakers(vals)}
							max={20}
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
