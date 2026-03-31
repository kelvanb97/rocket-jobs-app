import { existsSync, mkdirSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { errFrom, ok, type TResult } from "@rja-core/result"

export async function uploadFile(
	bucket: string,
	path: string,
	file: File | Buffer,
): Promise<TResult<void>> {
	try {
		const fullPath = resolve(process.cwd(), "data", "storage", bucket, path)
		const dir = dirname(fullPath)
		if (!existsSync(dir)) {
			mkdirSync(dir, { recursive: true })
		}
		const buffer = Buffer.isBuffer(file)
			? file
			: Buffer.from(await file.arrayBuffer())
		writeFileSync(fullPath, buffer)
		return ok(undefined)
	} catch (err) {
		return errFrom(
			`Error uploading ${path}: ${err instanceof Error ? err.message : String(err)}`,
		)
	}
}
