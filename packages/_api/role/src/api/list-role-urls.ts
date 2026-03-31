import { role } from "@rja-app/drizzle"
import { db } from "@rja-core/drizzle"
import { errFrom, ok, type TResult } from "@rja-core/result"
import { inArray } from "drizzle-orm"

export function listRoleUrls(urls: string[]): TResult<string[]> {
	try {
		const results = db()
			.select({ url: role.url })
			.from(role)
			.where(inArray(role.url, urls))
			.all()
		return ok(
			results.map((r) => r.url).filter((u): u is string => u !== null),
		)
	} catch (e) {
		return errFrom(
			`Error listing role URLs: ${e instanceof Error ? e.message : String(e)}`,
		)
	}
}
