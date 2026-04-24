import { z } from "zod"

export type { TRole, TNewRole } from "@rja-app/drizzle"

export const ROLE_SOURCES = [
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
	"deferred",
	"unavailable",
] as const

export type TRoleStatus = (typeof ROLE_STATUSES)[number]

export const roleStatusSchema = z.enum(ROLE_STATUSES)

export const getRoleSchema = z.object({
	id: z.number(),
})

export const listRolesSchema = z.object({
	page: z.number().min(1).default(1),
	pageSize: z.number().min(1).max(100).default(25),
	search: z.string().optional(),
	companyId: z.number().optional(),
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
	companyId: z.number().nullable().optional(),
	title: z.string().min(1),
	url: z.string().nullable().optional(),
	description: z.string().nullable().optional(),
	source: z.string().nullable().optional(),
	locationType: locationTypeSchema.nullable().optional(),
	location: z.string().nullable().optional(),
	salaryMin: z.number().nullable().optional(),
	salaryMax: z.number().nullable().optional(),
	status: roleStatusSchema.optional(),
	postedAt: z.date().nullable().optional(),
	notes: z.string().nullable().optional(),
})

export type TCreateRole = z.infer<typeof createRoleSchema>

export const updateRoleSchema = z.object({
	id: z.number(),
	companyId: z.number().nullable().optional(),
	title: z.string().min(1).optional(),
	url: z.string().nullable().optional(),
	description: z.string().nullable().optional(),
	source: z.string().nullable().optional(),
	locationType: locationTypeSchema.nullable().optional(),
	location: z.string().nullable().optional(),
	salaryMin: z.number().nullable().optional(),
	salaryMax: z.number().nullable().optional(),
	status: roleStatusSchema.optional(),
	postedAt: z.date().nullable().optional(),
	notes: z.string().nullable().optional(),
})

export type TUpdateRole = z.infer<typeof updateRoleSchema>

export const deleteRoleSchema = z.object({
	id: z.number(),
})
