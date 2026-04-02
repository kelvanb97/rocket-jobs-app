import type { TSourceName } from "@rja-api/settings/schema/scraper-config-schema"
import { startScrape } from "@rja-app/scraper/scrape-task"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
	try {
		const body = (await request.json().catch(() => ({}))) as {
			sources?: string
		}

		const sources = body.sources
			? (body.sources.split(",") as TSourceName[])
			: undefined

		const result = startScrape(sources)

		if (!result.ok) {
			return NextResponse.json({ error: result.error }, { status: 409 })
		}

		return NextResponse.json({ status: "started" })
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err)
		return NextResponse.json({ error: message }, { status: 500 })
	}
}
