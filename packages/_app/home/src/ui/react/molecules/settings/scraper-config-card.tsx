"use client"

import {
	type TScraperConfig,
	type TSourceName,
} from "@rja-api/settings/schema/scraper-config-schema"
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
import { InputLabelWrapper } from "@rja-design/ui/library/input-label-wrapper"
import { Label } from "@rja-design/ui/library/label"
import { MultiInput } from "@rja-design/ui/library/multi-input"
import { MultiSelect } from "@rja-design/ui/library/multi-select"
import { toast } from "@rja-design/ui/library/toast"
import { Tooltip } from "@rja-design/ui/library/tooltip"
import { YStack } from "@rja-design/ui/primitives/y-stack"
import { updateScraperConfigAction } from "#actions/settings-actions"
import type { Dispatch, SetStateAction } from "react"

const SOURCE_OPTIONS: { label: string; value: TSourceName }[] = [
	{ label: "LinkedIn", value: "linkedin" },
]

const BLANK_SCRAPER: TScraperConfig = {
	id: 0,
	userProfileId: 0,
	relevantKeywords: [],
	blockedKeywords: [],
	blockedCompanies: [],
	enabledSources: [],
	linkedinUrls: [],
	linkedinMaxPages: 5,
	linkedinMaxPerPage: 25,
	createdAt: null,
	updatedAt: null,
}

interface IScraperConfigCardProps {
	profileId: number
	scraper: TScraperConfig | null
	setScraper: Dispatch<SetStateAction<TScraperConfig | null>>
}

export function ScraperConfigCard({
	profileId,
	scraper,
	setScraper,
}: IScraperConfigCardProps) {
	const update = (field: keyof TScraperConfig, value: unknown) => {
		setScraper(
			(prev) =>
				({
					...(prev ?? {
						...BLANK_SCRAPER,
						userProfileId: profileId,
					}),
					[field]: value,
				}) as TScraperConfig,
		)
	}

	const { execute, result, status } = useAction(updateScraperConfigAction, {
		onSuccess: ({ data }) => {
			if (data) {
				toast.success("Saved!")
				setScraper(data)
			}
		},
	})
	const error = useActionError(result)
	useToastOnError(error, status)
	const isLoading = useIsLoading(status)

	const handleSave = () => {
		execute({
			userProfileId: profileId,
			relevantKeywords: scraper?.relevantKeywords ?? [],
			blockedKeywords: scraper?.blockedKeywords ?? [],
			blockedCompanies: scraper?.blockedCompanies ?? [],
			enabledSources: scraper?.enabledSources ?? [],
			linkedinUrls: scraper?.linkedinUrls ?? [],
			linkedinMaxPages: scraper?.linkedinMaxPages ?? 5,
			linkedinMaxPerPage: scraper?.linkedinMaxPerPage ?? 25,
		})
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Scraper Configuration</CardTitle>
				<CardDescription>
					Keywords and filters for job scraping.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<YStack className="gap-4">
					<InputLabelWrapper>
						<Label>
							Relevant Keywords
							<Tooltip
								iconClassName="size-3.5 text-muted-foreground"
								content="Roles must contain at least one of these keywords in the title to be kept."
							/>
						</Label>
						<MultiInput
							values={scraper?.relevantKeywords ?? []}
							onChange={(vals) =>
								update("relevantKeywords", vals)
							}
							max={50}
							placeholder="Leave empty to skip"
						/>
					</InputLabelWrapper>

					<InputLabelWrapper>
						<Label>
							Blocked Keywords
							<Tooltip
								iconClassName="size-3.5 text-muted-foreground"
								content="Roles are ignored if they contain any of these keywords in the title."
							/>
						</Label>
						<MultiInput
							values={scraper?.blockedKeywords ?? []}
							onChange={(vals) => update("blockedKeywords", vals)}
							max={50}
							placeholder="Leave empty to skip"
						/>
					</InputLabelWrapper>

					<InputLabelWrapper>
						<Label>
							Blocked Companies
							<Tooltip
								iconClassName="size-3.5 text-muted-foreground"
								content="Roles from these companies are ignored."
							/>
						</Label>
						<MultiInput
							values={scraper?.blockedCompanies ?? []}
							onChange={(vals) =>
								update("blockedCompanies", vals)
							}
							max={50}
							placeholder="Leave empty to skip"
						/>
					</InputLabelWrapper>

					<InputLabelWrapper>
						<Label>
							Enabled Sources
							<Tooltip
								iconClassName="size-3.5 text-muted-foreground"
								content="Job boards the scraper pulls from. Each run hits every enabled source."
							/>
						</Label>
						<MultiSelect<TSourceName>
							values={
								(scraper?.enabledSources ?? []) as TSourceName[]
							}
							onValueChange={(vals) =>
								update("enabledSources", vals)
							}
							options={SOURCE_OPTIONS}
							max={SOURCE_OPTIONS.length}
							placeholder="Select a source"
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
