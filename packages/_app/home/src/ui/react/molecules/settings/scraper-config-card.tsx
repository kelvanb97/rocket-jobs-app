"use client"

import type { TScraperConfig } from "@rja-api/settings/schema/scraper-config-schema"
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
import { toast } from "@rja-design/ui/library/toast"
import { YStack } from "@rja-design/ui/primitives/y-stack"
import { updateScraperConfigAction } from "#actions/settings-actions"
import { useState } from "react"

interface IScraperConfigCardProps {
	profileId: number
	scraper: TScraperConfig | null
	onSaved: (data: TScraperConfig) => void
}

export function ScraperConfigCard({
	profileId,
	scraper,
	onSaved,
}: IScraperConfigCardProps) {
	const [relevantKeywords, setRelevantKeywords] = useState<string[]>(
		scraper?.relevantKeywords ?? [],
	)
	const [blockedKeywords, setBlockedKeywords] = useState<string[]>(
		scraper?.blockedKeywords ?? [],
	)
	const [blockedCompanies, setBlockedCompanies] = useState<string[]>(
		scraper?.blockedCompanies ?? [],
	)
	const [enabledSources, setEnabledSources] = useState<string[]>(
		scraper?.enabledSources ?? [],
	)

	const { execute, result, status } = useAction(updateScraperConfigAction, {
		onSuccess: ({ data }) => {
			if (data) {
				toast.success("Saved!")
				onSaved(data)
			}
		},
	})
	const error = useActionError(result)
	useToastOnError(error, status)
	const isLoading = useIsLoading(status)

	const handleSave = () => {
		execute({
			userProfileId: profileId,
			relevantKeywords,
			blockedKeywords,
			blockedCompanies,
			enabledSources,
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
						<Label>Relevant Keywords</Label>
						<MultiInput
							values={relevantKeywords}
							onChange={setRelevantKeywords}
							max={50}
						/>
					</InputLabelWrapper>

					<InputLabelWrapper>
						<Label>Blocked Keywords</Label>
						<MultiInput
							values={blockedKeywords}
							onChange={setBlockedKeywords}
							max={50}
						/>
					</InputLabelWrapper>

					<InputLabelWrapper>
						<Label>Blocked Companies</Label>
						<MultiInput
							values={blockedCompanies}
							onChange={setBlockedCompanies}
							max={50}
						/>
					</InputLabelWrapper>

					<InputLabelWrapper>
						<Label>Enabled Sources</Label>
						<MultiInput
							values={enabledSources}
							onChange={setEnabledSources}
							max={10}
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
