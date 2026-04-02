import type {
	TLocationType,
	TRoleSource,
} from "@rja-api/role/schema/role-schema"

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
	onRole?: (role: ScrapedRole) => Promise<void>
	signal?: AbortSignal | undefined
}

export type TScrapeProgressEvent =
	| { type: "source:start"; source: string }
	| { type: "source:found"; source: string; count: number }
	| {
			type: "source:role"
			source: string
			title: string
			company: string | null
			status: "inserted" | "duplicate" | "skipped" | "filtered"
	  }
	| {
			type: "source:inserted"
			source: string
			inserted: number
			skipped: number
	  }
	| { type: "source:error"; source: string; error: string }
	| { type: "source:done"; source: string }
	| { type: "done" }

export type TScrapeProgressCallback = (event: TScrapeProgressEvent) => void
