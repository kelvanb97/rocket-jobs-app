import { z } from "zod"

export type { TCompany, TNewCompany } from "@rja-app/drizzle"

export const COMPANY_SIZES = [
	"1-10",
	"11-50",
	"51-200",
	"201-500",
	"501-1000",
	"1001-5000",
	"5000+",
] as const

export type TCompanySize = (typeof COMPANY_SIZES)[number]

export const companySizeSchema = z.enum(COMPANY_SIZES)

export const COMPANY_STAGES = [
	"Seed",
	"Series A",
	"Series B",
	"Series C+",
	"Public",
	"Bootstrapped",
] as const

export type TCompanyStage = (typeof COMPANY_STAGES)[number]

export const companyStageSchema = z.enum(COMPANY_STAGES)

export const getCompanySchema = z.object({
	id: z.number(),
})

export const listCompaniesSchema = z.object({
	page: z.number().min(1).default(1),
	pageSize: z.number().min(1).max(100).default(25),
	search: z.string().optional(),
	industry: z.string().optional(),
	stage: companyStageSchema.optional(),
	size: companySizeSchema.optional(),
})

export type TListCompanies = z.infer<typeof listCompaniesSchema>

export const createCompanySchema = z.object({
	name: z.string().min(1),
	website: z.string().nullable().optional(),
	linkedinUrl: z.string().nullable().optional(),
	size: companySizeSchema.nullable().optional(),
	stage: companyStageSchema.nullable().optional(),
	industry: z.string().nullable().optional(),
	notes: z.string().nullable().optional(),
})

export type TCreateCompany = z.infer<typeof createCompanySchema>

export const updateCompanySchema = z.object({
	id: z.number(),
	name: z.string().min(1).optional(),
	website: z.string().nullable().optional(),
	linkedinUrl: z.string().nullable().optional(),
	size: companySizeSchema.nullable().optional(),
	stage: companyStageSchema.nullable().optional(),
	industry: z.string().nullable().optional(),
	notes: z.string().nullable().optional(),
})

export type TUpdateCompany = z.infer<typeof updateCompanySchema>

export const deleteCompanySchema = z.object({
	id: z.number(),
})
