import { getLatestSha, getLocalSha } from "#next/lib/check-app-version"
import { VersionOutdatedBannerClient } from "#ui/react/banner-client"

export async function VersionOutdatedBanner() {
	const localSha = getLocalSha()
	if (!localSha) return null

	const latest = await getLatestSha()
	if (!latest.ok) return null

	if (latest.data === localSha) return null

	return <VersionOutdatedBannerClient latestSha={latest.data} />
}
