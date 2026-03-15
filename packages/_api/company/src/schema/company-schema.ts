import { z } from "zod"
import type { Database } from "@aja-app/supabase"

export type TCompany = {
	id: string
	name: string
	website: string | null
	linkedinUrl: string | null
	size: string | null
	stage: string | null
	industry: string | null
	notes: string | null
	createdAt: string | null
	updatedAt: string | null
}

export type TMarshalledCompany = Database["app"]["Tables"]["company"]["Row"]

export const getCompanySchema = z.object({
	id: z.string(),
})

export const listCompaniesSchema = z.object({
	page: z.number().min(1).default(1),
	pageSize: z.number().min(1).max(100).default(25),
	search: z.string().optional(),
	industry: z.string().optional(),
	stage: z.string().optional(),
	size: z.string().optional(),
})

export type TListCompanies = z.infer<typeof listCompaniesSchema>

export const createCompanySchema = z.object({
	name: z.string().min(1),
	website: z.string().nullable().optional(),
	linkedinUrl: z.string().nullable().optional(),
	size: z.string().nullable().optional(),
	stage: z.string().nullable().optional(),
	industry: z.string().nullable().optional(),
	notes: z.string().nullable().optional(),
})

export type TCreateCompany = z.infer<typeof createCompanySchema>

export const updateCompanySchema = z.object({
	id: z.string(),
	name: z.string().min(1).optional(),
	website: z.string().nullable().optional(),
	linkedinUrl: z.string().nullable().optional(),
	size: z.string().nullable().optional(),
	stage: z.string().nullable().optional(),
	industry: z.string().nullable().optional(),
	notes: z.string().nullable().optional(),
})

export type TUpdateCompany = z.infer<typeof updateCompanySchema>

export const deleteCompanySchema = z.object({
	id: z.string(),
})
