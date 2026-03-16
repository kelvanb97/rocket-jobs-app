"use server"

import { createCompany } from "@aja-api/company/api/create-company"
import { createRole } from "@aja-api/role/api/create-role"
import {
	SafeForClientError,
	actionClient,
} from "@aja-core/next-safe-action"
import { z } from "zod"

const createRoleWithCompanySchema = z.object({
	company: z
		.object({
			name: z.string().min(1),
			website: z.string().optional(),
			linkedinUrl: z.string().optional(),
			size: z.string().optional(),
			stage: z.string().optional(),
			industry: z.string().optional(),
			notes: z.string().optional(),
		})
		.optional(),
	title: z.string().min(1),
	url: z.string().optional(),
	description: z.string().optional(),
	source: z.string().optional(),
	locationType: z.string().optional(),
	location: z.string().optional(),
	salaryMin: z.number().optional(),
	salaryMax: z.number().optional(),
	notes: z.string().optional(),
})

export const createRoleWithCompanyAction = actionClient
	.schema(createRoleWithCompanySchema)
	.action(async ({ parsedInput }) => {
		let companyId: string | undefined

		if (parsedInput.company) {
			const companyResult = await createCompany(parsedInput.company)
			if (!companyResult.ok) {
				throw new SafeForClientError(companyResult.error.message)
			}
			companyId = companyResult.data.id
		}

		const roleResult = await createRole({
			companyId,
			title: parsedInput.title,
			url: parsedInput.url,
			description: parsedInput.description,
			source: parsedInput.source,
			locationType: parsedInput.locationType,
			location: parsedInput.location,
			salaryMin: parsedInput.salaryMin,
			salaryMax: parsedInput.salaryMax,
			notes: parsedInput.notes,
		})

		if (!roleResult.ok) {
			throw new SafeForClientError(roleResult.error.message)
		}

		return roleResult.data
	})
