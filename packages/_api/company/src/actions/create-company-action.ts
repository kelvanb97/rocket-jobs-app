"use server"

import {
	actionClient,
	UnknownServerError,
} from "@aja-core/next-safe-action"
import { createCompanySchema } from "#schema/company-schema"
import { createCompany } from "#api/create-company"

export const createCompanyAction = actionClient
	.inputSchema(createCompanySchema)
	.action(async ({ parsedInput }) => {
		const result = await createCompany(parsedInput)
		if (!result.ok)
			throw new UnknownServerError("createCompanyAction", result.error)
		return { success: true, company: result.data }
	})
