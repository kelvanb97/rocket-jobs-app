import type { Database } from "@aja-app/supabase"
import { z } from "zod"

export const ROLE_SOURCES = [
	"himalayas",
	"jobicy",
	"remoteok",
	"weworkremotely",
	"linkedin",
	"indeed",
	"company-website",
	"referral",
	"recruiter",
	"other",
] as const

export type TRoleSource = (typeof ROLE_SOURCES)[number]

export const roleSourceSchema = z.enum(ROLE_SOURCES)

export const LOCATION_TYPES = ["remote", "hybrid", "on-site"] as const

export type TLocationType = (typeof LOCATION_TYPES)[number]

export const locationTypeSchema = z.enum(LOCATION_TYPES)

export const ROLE_STATUSES = [
	"pending",
	"applied",
	"rejected",
	"wont_do",
] as const

export type TRoleStatus = (typeof ROLE_STATUSES)[number]

export const roleStatusSchema = z.enum(ROLE_STATUSES)

export type TRole = {
	id: string
	companyId: string | null
	title: string
	url: string | null
	description: string | null
	source: TRoleSource | null
	locationType: TLocationType | null
	location: string | null
	salaryMin: number | null
	salaryMax: number | null
	status: TRoleStatus
	postedAt: string | null
	notes: string | null
	createdAt: string | null
	updatedAt: string | null
}

export type TMarshalledRole = Database["app"]["Tables"]["role"]["Row"]

export const getRoleSchema = z.object({
	id: z.string(),
})

export const listRolesSchema = z.object({
	page: z.number().min(1).default(1),
	pageSize: z.number().min(1).max(100).default(25),
	search: z.string().optional(),
	companyId: z.string().optional(),
	status: roleStatusSchema.optional(),
	locationType: locationTypeSchema.optional(),
	source: roleSourceSchema.optional(),
	scoreMin: z.number().min(0).max(100).optional(),
	scoreMax: z.number().min(0).max(100).optional(),
	sortBy: z
		.enum(["created_at", "posted_at", "title", "status", "score"])
		.default("created_at")
		.optional(),
	sortOrder: z.enum(["asc", "desc"]).default("desc").optional(),
})

export type TListRoles = z.infer<typeof listRolesSchema>

export const createRoleSchema = z.object({
	companyId: z.string().nullable().optional(),
	title: z.string().min(1),
	url: z.string().nullable().optional(),
	description: z.string().nullable().optional(),
	source: roleSourceSchema.nullable().optional(),
	locationType: locationTypeSchema.nullable().optional(),
	location: z.string().nullable().optional(),
	salaryMin: z.number().nullable().optional(),
	salaryMax: z.number().nullable().optional(),
	status: roleStatusSchema.optional(),
	postedAt: z.string().nullable().optional(),
	notes: z.string().nullable().optional(),
})

export type TCreateRole = z.infer<typeof createRoleSchema>

export const updateRoleSchema = z.object({
	id: z.string(),
	companyId: z.string().nullable().optional(),
	title: z.string().min(1).optional(),
	url: z.string().nullable().optional(),
	description: z.string().nullable().optional(),
	source: roleSourceSchema.nullable().optional(),
	locationType: locationTypeSchema.nullable().optional(),
	location: z.string().nullable().optional(),
	salaryMin: z.number().nullable().optional(),
	salaryMax: z.number().nullable().optional(),
	status: roleStatusSchema.optional(),
	postedAt: z.string().nullable().optional(),
	notes: z.string().nullable().optional(),
})

export type TUpdateRole = z.infer<typeof updateRoleSchema>

export const deleteRoleSchema = z.object({
	id: z.string(),
})
