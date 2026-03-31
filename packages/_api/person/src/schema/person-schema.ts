import { z } from "zod"

export type { TNewPerson, TPerson } from "@rja-app/drizzle"

export const getPersonSchema = z.object({
	id: z.number(),
})

export const listPersonsSchema = z.object({
	page: z.number().min(1).default(1),
	pageSize: z.number().min(1).max(100).default(25),
	search: z.string().optional(),
	email: z.string().optional(),
	companyId: z.number().optional(),
})

export type TListPersons = z.infer<typeof listPersonsSchema>

export const createPersonSchema = z.object({
	companyId: z.number().nullable().optional(),
	name: z.string().min(1),
	title: z.string().nullable().optional(),
	email: z.string().nullable().optional(),
	linkedinUrl: z.string().nullable().optional(),
	notes: z.string().nullable().optional(),
})

export type TCreatePerson = z.infer<typeof createPersonSchema>

export const updatePersonSchema = z.object({
	id: z.number(),
	companyId: z.number().nullable().optional(),
	name: z.string().min(1).optional(),
	title: z.string().nullable().optional(),
	email: z.string().nullable().optional(),
	linkedinUrl: z.string().nullable().optional(),
	notes: z.string().nullable().optional(),
})

export type TUpdatePerson = z.infer<typeof updatePersonSchema>

export const deletePersonSchema = z.object({
	id: z.number(),
})
