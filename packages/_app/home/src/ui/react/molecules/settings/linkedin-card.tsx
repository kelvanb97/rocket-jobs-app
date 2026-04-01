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
import { Input } from "@rja-design/ui/library/input"
import { InputGroup } from "@rja-design/ui/library/input-group"
import { Label } from "@rja-design/ui/library/label"
import { MultiInput } from "@rja-design/ui/library/multi-input"
import { toast } from "@rja-design/ui/library/toast"
import { YStack } from "@rja-design/ui/primitives/y-stack"
import { updateScraperConfigAction } from "#actions/settings-actions"
import { useState } from "react"

interface ILinkedinCardProps {
	profileId: number
	scraper: TScraperConfig | null
	onSaved: () => void
}

export function LinkedInCard({
	profileId,
	scraper,
	onSaved,
}: ILinkedinCardProps) {
	const [linkedinUrls, setLinkedinUrls] = useState<string[]>(
		scraper?.linkedinUrls ?? [],
	)
	const [linkedinMaxPages, setLinkedinMaxPages] = useState(
		scraper?.linkedinMaxPages ?? 5,
	)
	const [linkedinMaxPerPage, setLinkedinMaxPerPage] = useState(
		scraper?.linkedinMaxPerPage ?? 25,
	)

	const { execute, result, status } = useAction(updateScraperConfigAction, {
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
			relevantKeywords: scraper?.relevantKeywords ?? [],
			blockedKeywords: scraper?.blockedKeywords ?? [],
			blockedCompanies: scraper?.blockedCompanies ?? [],
			enabledSources: scraper?.enabledSources ?? [],
			googleTitles: scraper?.googleTitles ?? [],
			googleRemote: scraper?.googleRemote ?? true,
			googleFullTimeOnly: scraper?.googleFullTimeOnly ?? true,
			googleFreshnessDays: scraper?.googleFreshnessDays ?? 3,
			googleMaxPages: scraper?.googleMaxPages ?? 5,
			linkedinUrls,
			linkedinMaxPages,
			linkedinMaxPerPage,
		})
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>LinkedIn Search</CardTitle>
				<CardDescription>
					Search parameters for LinkedIn scraping.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<YStack className="gap-4">
					<InputGroup>
						<Label>Search URLs</Label>
						<MultiInput
							values={linkedinUrls}
							onChange={setLinkedinUrls}
							max={30}
						/>
					</InputGroup>

					<InputGroup>
						<Label htmlFor="linkedin-max-pages">Max Pages</Label>
						<Input
							id="linkedin-max-pages"
							type="number"
							value={linkedinMaxPages}
							onChange={(e) =>
								setLinkedinMaxPages(Number(e.target.value))
							}
						/>
					</InputGroup>

					<InputGroup>
						<Label htmlFor="linkedin-max-per-page">
							Max Per Page
						</Label>
						<Input
							id="linkedin-max-per-page"
							type="number"
							value={linkedinMaxPerPage}
							onChange={(e) =>
								setLinkedinMaxPerPage(Number(e.target.value))
							}
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
