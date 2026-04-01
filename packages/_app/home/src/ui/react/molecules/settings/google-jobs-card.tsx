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
import { Switch } from "@rja-design/ui/library/switch"
import { toast } from "@rja-design/ui/library/toast"
import { YStack } from "@rja-design/ui/primitives/y-stack"
import { updateScraperConfigAction } from "#actions/settings-actions"
import { useState } from "react"

interface IGoogleJobsCardProps {
	profileId: number
	scraper: TScraperConfig | null
	onSaved: () => void
}

export function GoogleJobsCard({
	profileId,
	scraper,
	onSaved,
}: IGoogleJobsCardProps) {
	const [googleTitles, setGoogleTitles] = useState<string[]>(
		scraper?.googleTitles ?? [],
	)
	const [googleRemote, setGoogleRemote] = useState(
		scraper?.googleRemote ?? true,
	)
	const [googleFullTimeOnly, setGoogleFullTimeOnly] = useState(
		scraper?.googleFullTimeOnly ?? true,
	)
	const [googleFreshnessDays, setGoogleFreshnessDays] = useState(
		scraper?.googleFreshnessDays ?? 3,
	)
	const [googleMaxPages, setGoogleMaxPages] = useState(
		scraper?.googleMaxPages ?? 5,
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
			googleTitles,
			googleRemote,
			googleFullTimeOnly,
			googleFreshnessDays,
			googleMaxPages,
			linkedinUrls: scraper?.linkedinUrls ?? [],
			linkedinMaxPages: scraper?.linkedinMaxPages ?? 5,
			linkedinMaxPerPage: scraper?.linkedinMaxPerPage ?? 25,
		})
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Google Jobs Search</CardTitle>
				<CardDescription>
					Search parameters for Google Jobs scraping.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<YStack className="gap-4">
					<InputGroup>
						<Label>Search Titles</Label>
						<MultiInput
							values={googleTitles}
							onChange={setGoogleTitles}
							max={50}
						/>
					</InputGroup>

					<Switch
						checked={googleRemote}
						onCheckedChange={setGoogleRemote}
						rightLabel="Remote Only"
					/>

					<Switch
						checked={googleFullTimeOnly}
						onCheckedChange={setGoogleFullTimeOnly}
						rightLabel="Full-time Only"
					/>

					<InputGroup>
						<Label htmlFor="google-freshness-days">
							Freshness (Days)
						</Label>
						<Input
							id="google-freshness-days"
							type="number"
							value={googleFreshnessDays}
							onChange={(e) =>
								setGoogleFreshnessDays(Number(e.target.value))
							}
						/>
					</InputGroup>

					<InputGroup>
						<Label htmlFor="google-max-pages">
							Max Pages Per Query
						</Label>
						<Input
							id="google-max-pages"
							type="number"
							value={googleMaxPages}
							onChange={(e) =>
								setGoogleMaxPages(Number(e.target.value))
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
