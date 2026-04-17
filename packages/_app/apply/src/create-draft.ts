import { createApplication } from "@rja-api/application/api/create-application"
import { listApplications } from "@rja-api/application/api/list-applications"
import { updateApplication } from "@rja-api/application/api/update-application"
import { listFiles } from "@rja-api/storage/api/list-files"
import { errFrom, ok, type TResult } from "@rja-core/result"
import type { TCreateDraftResult } from "./types"

type TCreateDraftInput = {
	roleId: number
	notes?: string | undefined
}

function findExistingDocPaths(roleId: number): {
	resumePath: string | null
	coverLetterPath: string | null
} {
	const filesResult = listFiles("applications", String(roleId))
	if (!filesResult.ok) return { resumePath: null, coverLetterPath: null }
	const resume = filesResult.data.find(
		(f) =>
			f.name.toLowerCase().includes("resume") &&
			!f.name.toLowerCase().includes("cover"),
	)
	const coverLetter = filesResult.data.find((f) =>
		f.name.toLowerCase().includes("cover"),
	)
	return {
		resumePath: resume ? `${roleId}/${resume.name}` : null,
		coverLetterPath: coverLetter ? `${roleId}/${coverLetter.name}` : null,
	}
}

export function createDraft(
	input: TCreateDraftInput,
): TResult<TCreateDraftResult> {
	const existing = listApplications({
		roleId: input.roleId,
		page: 1,
		pageSize: 1,
	})
	if (!existing.ok) return existing

	const onDisk = findExistingDocPaths(input.roleId)

	if (existing.data.applications[0]) {
		const app = existing.data.applications[0]
		const resumePath = app.resumePath ?? onDisk.resumePath
		const coverLetterPath = app.coverLetterPath ?? onDisk.coverLetterPath
		const needsUpdate =
			resumePath !== app.resumePath ||
			coverLetterPath !== app.coverLetterPath
		if (needsUpdate) {
			const updated = updateApplication({
				id: app.id,
				resumePath,
				coverLetterPath,
			})
			if (!updated.ok) return errFrom(updated.error.message)
			return ok({
				applicationId: updated.data.id,
				resumePath: updated.data.resumePath,
				coverLetterPath: updated.data.coverLetterPath,
			})
		}
		return ok({
			applicationId: app.id,
			resumePath: app.resumePath,
			coverLetterPath: app.coverLetterPath,
		})
	}

	const created = createApplication({
		roleId: input.roleId,
		status: "draft",
		notes: input.notes ?? null,
		resumePath: onDisk.resumePath,
		coverLetterPath: onDisk.coverLetterPath,
	})
	if (!created.ok) return created

	return ok({
		applicationId: created.data.id,
		resumePath: created.data.resumePath,
		coverLetterPath: created.data.coverLetterPath,
	})
}
