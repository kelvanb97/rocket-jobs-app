import { existsSync, readdirSync } from "node:fs"
import { resolve } from "node:path"
import { ok, type TResult } from "@aja-core/result"

export function listFiles(
	bucket: string,
	folder: string,
	options?: { search?: string },
): TResult<Array<{ name: string }>> {
	const dir = resolve(process.cwd(), "data", "storage", bucket, folder)
	if (!existsSync(dir)) return ok([])
	let entries = readdirSync(dir)
	if (options?.search) {
		entries = entries.filter((name) => name.includes(options.search!))
	}
	return ok(entries.map((name) => ({ name })))
}
