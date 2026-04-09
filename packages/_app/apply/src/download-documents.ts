import { resolve } from "node:path"
import { ok, type TResult } from "@rja-core/result"
import type { TDownloadDocumentsResult } from "./types"

const STORAGE_BUCKET = "applications"

type TDownloadDocumentsInput = {
	resumePath: string
	coverLetterPath: string
}

export function downloadDocuments(
	input: TDownloadDocumentsInput,
): TResult<TDownloadDocumentsResult> {
	const storageRoot = resolve(
		process.cwd(),
		"data",
		"storage",
		STORAGE_BUCKET,
	)
	const resumeLocal = resolve(storageRoot, input.resumePath)
	const coverLetterLocal = resolve(storageRoot, input.coverLetterPath)
	return ok({ resumeLocal, coverLetterLocal })
}
