import { getEeoConfig } from "@rja-api/settings/api/get-eeo-config"
import { getFormDefaults } from "@rja-api/settings/api/get-form-defaults"
import { getLlmConfig } from "@rja-api/settings/api/get-llm-config"
import { getScoringConfig } from "@rja-api/settings/api/get-scoring-config"
import { getScraperConfig } from "@rja-api/settings/api/get-scraper-config"
import { getUserProfile } from "@rja-api/settings/api/get-user-profile"
import { AppShell } from "#templates/app-shell"
import { SettingsTemplate } from "#templates/settings-template"

export async function SettingsScreen() {
	const profileResult = getUserProfile()
	const eeoResult = getEeoConfig()
	const formDefaultsResult = getFormDefaults()
	const scoringResult = getScoringConfig()
	const scraperResult = getScraperConfig()
	const llmResult = getLlmConfig()

	return (
		<AppShell activePage="settings">
			<SettingsTemplate
				initialProfile={profileResult.ok ? profileResult.data : null}
				initialEeo={eeoResult.ok ? eeoResult.data : null}
				initialFormDefaults={
					formDefaultsResult.ok ? formDefaultsResult.data : null
				}
				initialScoring={scoringResult.ok ? scoringResult.data : null}
				initialScraper={scraperResult.ok ? scraperResult.data : null}
				llm={llmResult.ok ? llmResult.data : null}
			/>
		</AppShell>
	)
}
