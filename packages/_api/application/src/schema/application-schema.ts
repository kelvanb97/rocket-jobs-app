import { z } from "zod"
import type { Database } from "@aja-app/supabase"

export type TApplication = {
	id: string
	roleId: string | null
	status: string
	resumePath: string | null
	coverLetterPath: string | null
	submittedAt: string | null
	notes: string | null
	createdAt: string | null
	updatedAt: string | null
}

export type TMarshalledApplication = Database["app"]["Tables"]["application"]["Row"]

export const getApplicationSchema = z.object({
	id: z.string(),
})

export const listApplicationsSchema = z.object({
	page: z.number().min(1).default(1),
	pageSize: z.number().min(1).max(100).default(25),
	roleId: z.string().optional(),
	status: z.string().optional(),
})

export type TListApplications = z.infer<typeof listApplicationsSchema>

export const createApplicationSchema = z.object({
	roleId: z.string().nullable().optional(),
	status: z.string().optional(),
	resumePath: z.string().nullable().optional(),
	coverLetterPath: z.string().nullable().optional(),
	submittedAt: z.string().nullable().optional(),
	notes: z.string().nullable().optional(),
})

export type TCreateApplication = z.infer<typeof createApplicationSchema>

export const updateApplicationSchema = z.object({
	id: z.string(),
	roleId: z.string().nullable().optional(),
	status: z.string().optional(),
	resumePath: z.string().nullable().optional(),
	coverLetterPath: z.string().nullable().optional(),
	submittedAt: z.string().nullable().optional(),
	notes: z.string().nullable().optional(),
})

export type TUpdateApplication = z.infer<typeof updateApplicationSchema>

export const deleteApplicationSchema = z.object({
	id: z.string(),
})
