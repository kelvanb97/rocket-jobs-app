"use server"

import {
	actionClient,
	UnknownServerError,
} from "@aja-core/next-safe-action"
import { deleteCompanySchema } from "#schema/company-schema"
import { deleteCompany } from "#api/delete-company"

export const deleteCompanyAction = actionClient
	.inputSchema(deleteCompanySchema)
	.action(async ({ parsedInput }) => {
		const result = await deleteCompany(parsedInput.id)
		if (!result.ok)
			throw new UnknownServerError("deleteCompanyAction", result.error)
		return { success: true, id: parsedInput.id }
	})
