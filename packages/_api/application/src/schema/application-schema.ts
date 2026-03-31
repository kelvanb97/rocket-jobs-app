import { z } from "zod"

export type { TApplication, TNewApplication } from "@rja-app/drizzle"

export const APPLICATION_STATUSES = [
	"draft",
	"submitted",
	"outreach_sent",
	"phone_screen",
	"interview",
	"offer",
	"rejected",
] as const

export type TApplicationStatus = (typeof APPLICATION_STATUSES)[number]

export const applicationStatusSchema = z.enum(APPLICATION_STATUSES)

export const getApplicationSchema = z.object({
	id: z.number(),
})

export const listApplicationsSchema = z.object({
	page: z.number().min(1).default(1),
	pageSize: z.number().min(1).max(100).default(25),
	roleId: z.number().optional(),
	status: applicationStatusSchema.optional(),
})

export type TListApplications = z.infer<typeof listApplicationsSchema>

export const createApplicationSchema = z.object({
	roleId: z.number().nullable().optional(),
	status: applicationStatusSchema.optional(),
	resumePath: z.string().nullable().optional(),
	coverLetterPath: z.string().nullable().optional(),
	screenshotPath: z.string().nullable().optional(),
	submittedAt: z.date().nullable().optional(),
	notes: z.string().nullable().optional(),
})

export type TCreateApplication = z.infer<typeof createApplicationSchema>

export const updateApplicationSchema = z.object({
	id: z.number(),
	roleId: z.number().nullable().optional(),
	status: applicationStatusSchema.optional(),
	resumePath: z.string().nullable().optional(),
	coverLetterPath: z.string().nullable().optional(),
	screenshotPath: z.string().nullable().optional(),
	submittedAt: z.date().nullable().optional(),
	notes: z.string().nullable().optional(),
})

export type TUpdateApplication = z.infer<typeof updateApplicationSchema>

export const deleteApplicationSchema = z.object({
	id: z.number(),
})
