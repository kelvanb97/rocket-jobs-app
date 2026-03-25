import type {
	TLocationType,
	TRoleSource,
} from "@aja-api/role/schema/role-schema"

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

export type TSourceScrapeOptions = {
	onBatch?: (roles: ScrapedRole[]) => Promise<void>
	signal?: AbortSignal | undefined
}

export type TScrapeProgressEvent =
	| { type: "source:start"; source: string }
	| { type: "source:found"; source: string; count: number }
	| {
			type: "source:page"
			source: string
			page: number
			found: number
			inserted: number
			skipped: number
			filtered: number
	  }
	| {
			type: "source:inserted"
			source: string
			inserted: number
			skipped: number
	  }
	| { type: "source:error"; source: string; error: string }
	| { type: "source:done"; source: string }
	| { type: "heartbeat"; timestamp: string }
	| { type: "done" }

export type TScrapeProgressCallback = (event: TScrapeProgressEvent) => void
