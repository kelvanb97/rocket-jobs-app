"use server"

import { updateCompany } from "@aja-api/company/api/update-company"
import { updateRole } from "@aja-api/role/api/update-role"
import {
	locationTypeSchema,
	roleSourceSchema,
	roleStatusSchema,
} from "@aja-api/role/schema/role-schema"
import { actionClient, SafeForClientError } from "@aja-core/next-safe-action"
import { z } from "zod"

const updateRoleWithCompanySchema = z.object({
	role: z.object({
		id: z.string(),
		title: z.string().min(1).optional(),
		url: z.string().nullable().optional(),
		description: z.string().nullable().optional(),
		source: roleSourceSchema.nullable().optional(),
		locationType: locationTypeSchema.nullable().optional(),
		location: z.string().nullable().optional(),
		salaryMin: z.number().nullable().optional(),
		salaryMax: z.number().nullable().optional(),
		status: roleStatusSchema.optional(),
		notes: z.string().nullable().optional(),
	}),
	company: z
		.object({
			id: z.string(),
			name: z.string().min(1).optional(),
			website: z.string().nullable().optional(),
			linkedinUrl: z.string().nullable().optional(),
			size: z.string().nullable().optional(),
			stage: z.string().nullable().optional(),
			industry: z.string().nullable().optional(),
			notes: z.string().nullable().optional(),
		})
		.optional(),
})

export const updateRoleWithCompanyAction = actionClient
	.inputSchema(updateRoleWithCompanySchema)
	.action(async ({ parsedInput }) => {
		if (parsedInput.company) {
			const companyResult = await updateCompany(parsedInput.company)
			if (!companyResult.ok) {
				throw new SafeForClientError(companyResult.error.message)
			}
		}

		const roleResult = await updateRole(parsedInput.role)
		if (!roleResult.ok) {
			throw new SafeForClientError(roleResult.error.message)
		}

		return roleResult.data
	})
