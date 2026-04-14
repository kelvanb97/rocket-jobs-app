import type {
	TLocationType,
	TRoleSource,
} from "@rja-api/role/schema/role-schema"

export type TScrapeHandoffReasonCode =
	| "modal_overlay"
	| "captcha"
	| "bot_block"
	| "manual_intervention_required"

export type TScrapeHandoffActor = "harness" | "user"

export type TScrapeResumeMode = "in_place"

export type TScrapeHandoff = {
	source: TRoleSource
	reasonCode: TScrapeHandoffReasonCode
	message: string
	currentUrl: string
	preferredActor: TScrapeHandoffActor
	resumeMode: TScrapeResumeMode
}

export type ScrapedRole = {
	title: string
	url: string | null
	company: string | null
	description: string | null
	source: TRoleSource
	location_type: TLocationType | null
	location: string | null
	salary_min: number | null
	salary_max: number | null
	posted_at: string | null
}

export type TSourceHandoff = TScrapeHandoff & {
	recoverByHarness?: () => Promise<void>
}

export type TSourceScrapeOptions = {
	onRole?: (role: ScrapedRole) => Promise<void>
	onHandoff?: (handoff: TSourceHandoff) => Promise<void>
	signal?: AbortSignal | undefined
}
