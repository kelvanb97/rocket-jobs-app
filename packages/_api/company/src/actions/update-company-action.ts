"use server"

import {
	actionClient,
	UnknownServerError,
} from "@aja-core/next-safe-action"
import { updateCompanySchema } from "#schema/company-schema"
import { updateCompany } from "#api/update-company"

export const updateCompanyAction = actionClient
	.inputSchema(updateCompanySchema)
	.action(async ({ parsedInput }) => {
		const result = await updateCompany(parsedInput)
		if (!result.ok)
			throw new UnknownServerError("updateCompanyAction", result.error)
		return { success: true, company: result.data }
	})
