import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { errFrom, ok, type TResult } from "@aja-core/result"

export function downloadFile(bucket: string, path: string): TResult<Buffer> {
	try {
		const fullPath = resolve(process.cwd(), "data", "storage", bucket, path)
		return ok(readFileSync(fullPath))
	} catch (err) {
		return errFrom(
			`Error downloading ${path}: ${err instanceof Error ? err.message : String(err)}`,
		)
	}
}
