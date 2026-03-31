import { mkdirSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"
import { downloadFile } from "@rja-api/storage/api/download-file"
import { errFrom, ok, type TResult } from "@rja-core/result"
import type { TDownloadDocumentsResult } from "./types"

type TDownloadDocumentsInput = {
	resumePath: string
	coverLetterPath: string
	slug: string
}

export function downloadDocuments(
	input: TDownloadDocumentsInput,
): TResult<TDownloadDocumentsResult> {
	const dir = resolve(process.cwd(), "data", "applications", input.slug)
	mkdirSync(dir, { recursive: true })

	const resume = downloadFile("applications", input.resumePath)
	if (!resume.ok)
		return errFrom(`Failed to download resume: ${resume.error.message}`)

	const resumeLocal = resolve(dir, "resume.docx")
	writeFileSync(resumeLocal, resume.data)

	const coverLetter = downloadFile("applications", input.coverLetterPath)
	if (!coverLetter.ok)
		return errFrom(
			`Failed to download cover letter: ${coverLetter.error.message}`,
		)

	const coverLetterLocal = resolve(dir, "cover-letter.docx")
	writeFileSync(coverLetterLocal, coverLetter.data)

	return ok({ resumeLocal, coverLetterLocal })
}
