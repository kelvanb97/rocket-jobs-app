import {
	getLatestSha,
	getLocalSha,
	getLocalUpstreamSha,
} from "#next/lib/check-app-version"
import { VersionOutdatedBannerClient } from "#ui/react/banner-client"

export async function VersionOutdatedBanner() {
	const localSha = getLocalSha()
	const localUpstreamSha = getLocalUpstreamSha()
	if (!localSha && !localUpstreamSha) return null

	const latest = await getLatestSha()
	if (!latest.ok) return null

	if (latest.data === localSha || latest.data === localUpstreamSha) return null

	return <VersionOutdatedBannerClient latestSha={latest.data} />
}
