import { getEeoConfig } from "@rja-api/settings/api/get-eeo-config"
import { getFormDefaults } from "@rja-api/settings/api/get-form-defaults"
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

	return (
		<AppShell activePage="settings">
			<SettingsTemplate
				profile={profileResult.ok ? profileResult.data : null}
				eeo={eeoResult.ok ? eeoResult.data : null}
				formDefaults={
					formDefaultsResult.ok ? formDefaultsResult.data : null
				}
				scoring={scoringResult.ok ? scoringResult.data : null}
				scraper={scraperResult.ok ? scraperResult.data : null}
			/>
		</AppShell>
	)
}
