import type { TSourceName } from "@rja-api/settings/schema/scraper-config-schema"
import type { TScrapeHandoff } from "#types"

export type TNeedsAuthEntry = {
	name: TSourceName
	displayName: string
	homepageUrl: string
}

export class AuthRequiredError extends Error {
	readonly needsAuth: TNeedsAuthEntry[]
	constructor(needsAuth: TNeedsAuthEntry[]) {
		super(
			`Authentication required for: ${needsAuth.map((s) => s.name).join(", ")}`,
		)
		this.name = "AuthRequiredError"
		this.needsAuth = needsAuth
	}
}

export class ScrapeHandoffRequiredError extends Error {
	readonly handoff: TScrapeHandoff
	constructor(handoff: TScrapeHandoff) {
		super(handoff.message)
		this.name = "ScrapeHandoffRequiredError"
		this.handoff = handoff
	}
}
