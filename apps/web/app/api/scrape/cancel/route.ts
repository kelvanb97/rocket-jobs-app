import { cancelScrape } from "@rja-app/scraper/scrape-task"
import { NextResponse } from "next/server"

export async function POST() {
	const result = cancelScrape()

	if (!result.ok) {
		return NextResponse.json(
			{ error: "No scrape in progress" },
			{ status: 409 },
		)
	}

	return NextResponse.json({ status: "cancelled" })
}
