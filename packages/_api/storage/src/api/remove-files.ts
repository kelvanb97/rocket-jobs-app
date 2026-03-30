import { existsSync, unlinkSync } from "node:fs"
import { resolve } from "node:path"
import { errFrom, ok, type TResult } from "@aja-core/result"

export function removeFiles(bucket: string, paths: string[]): TResult<void> {
	try {
		for (const path of paths) {
			const fullPath = resolve(
				process.cwd(),
				"data",
				"storage",
				bucket,
				path,
			)
			if (existsSync(fullPath)) unlinkSync(fullPath)
		}
		return ok(undefined)
	} catch (err) {
		return errFrom(
			`Error removing files: ${err instanceof Error ? err.message : String(err)}`,
		)
	}
}
