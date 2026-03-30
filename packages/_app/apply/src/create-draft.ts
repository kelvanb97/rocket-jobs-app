import { createApplication } from "@aja-api/application/api/create-application"
import { ok, type TResult } from "@aja-core/result"
import type { TCreateDraftResult } from "./types"

type TCreateDraftInput = {
	roleId: number
	notes?: string | undefined
}

export function createDraft(
	input: TCreateDraftInput,
): TResult<TCreateDraftResult> {
	const result = createApplication({
		roleId: input.roleId,
		status: "draft",
		notes: input.notes ?? null,
	})

	if (!result.ok) return result

	return ok({
		applicationId: result.data.id,
		resumePath: result.data.resumePath,
		coverLetterPath: result.data.coverLetterPath,
	})
}
