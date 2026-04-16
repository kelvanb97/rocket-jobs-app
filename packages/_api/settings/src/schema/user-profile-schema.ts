import { z } from "zod"

export type {
	TUserProfile,
	TNewUserProfile,
	TWorkExperience,
	TNewWorkExperience,
	TEducation,
	TNewEducation,
	TCertification,
	TNewCertification,
} from "@rja-app/drizzle"

export const SENIORITY_LEVELS = [
	"junior",
	"mid",
	"senior",
	"staff",
	"principal",
	"director",
] as const
export type TSeniority = (typeof SENIORITY_LEVELS)[number]

export const WORK_EXPERIENCE_TYPES = [
	"full-time",
	"contract",
	"founder",
	"self-employed",
] as const
export type TWorkExperienceType = (typeof WORK_EXPERIENCE_TYPES)[number]

export const LOCATION_TYPES = ["remote", "hybrid", "on-site"] as const
export type TLocationType = (typeof LOCATION_TYPES)[number]

export type TUserProfileFull = {
	id: number
	name: string
	email: string
	phone: string
	links: string[]
	location: string
	address: string
	jobTitle: string
	seniority: string
	yearsOfExperience: number
	summary: string
	skills: string[]
	preferredLocationTypes: TLocationType[]
	preferredLocations: string[]
	salaryMin: number
	salaryMax: number
	desiredSalary: number
	startDateWeeksOut: number
	industries: string[]
	dealbreakers: string[]
	domainExpertise: string[]
	createdAt: Date | null
	updatedAt: Date | null
	workExperience: Array<{
		id: number
		userProfileId: number
		sortOrder: number
		company: string
		title: string
		startDate: string
		endDate: string
		type: string
		summary: string
		highlights: string[]
		createdAt: Date | null
		updatedAt: Date | null
	}>
	education: Array<{
		id: number
		userProfileId: number
		sortOrder: number
		degree: string
		field: string
		institution: string
		gpa: string
		createdAt: Date | null
		updatedAt: Date | null
	}>
	certifications: Array<{
		id: number
		userProfileId: number
		sortOrder: number
		name: string
		issuer: string
		issueDate: string | null
		expirationDate: string | null
		url: string | null
		createdAt: Date | null
		updatedAt: Date | null
	}>
}

export const upsertUserProfileSchema = z.object({
	id: z.number().optional(),
	name: z.string().min(1, "Name is required"),
	email: z.string().min(1, "Email is required"),
	phone: z.string(),
	links: z.array(z.string()),
	location: z.string(),
	address: z.string(),
	jobTitle: z.string().min(1, "Job title is required"),
	seniority: z.enum(SENIORITY_LEVELS),
	yearsOfExperience: z.number().int().min(0),
	summary: z.string(),
	skills: z.array(z.string()),
	preferredLocationTypes: z.array(z.enum(LOCATION_TYPES)),
	preferredLocations: z.array(z.string()),
	salaryMin: z.number().int().min(0),
	salaryMax: z.number().int().min(0),
	desiredSalary: z.number().int().min(0),
	startDateWeeksOut: z.number().int().min(0),
	industries: z.array(z.string()),
	dealbreakers: z.array(z.string()),
	domainExpertise: z.array(z.string()),
})

export type TUpsertUserProfile = z.infer<typeof upsertUserProfileSchema>

export const upsertWorkExperienceSchema = z.object({
	id: z.number().optional(),
	userProfileId: z.number(),
	sortOrder: z.number().int().min(0),
	company: z.string().min(1, "Company is required"),
	title: z.string().min(1, "Title is required"),
	startDate: z.string().min(1, "Start date is required"),
	endDate: z.string().min(1, "End date is required"),
	type: z.enum(WORK_EXPERIENCE_TYPES),
	summary: z.string(),
	highlights: z.array(z.string()),
})

export type TUpsertWorkExperience = z.infer<typeof upsertWorkExperienceSchema>

export const deleteWorkExperienceSchema = z.object({
	id: z.number(),
})

export const upsertEducationSchema = z.object({
	id: z.number().optional(),
	userProfileId: z.number(),
	sortOrder: z.number().int().min(0),
	degree: z.string().min(1, "Degree is required"),
	field: z.string().min(1, "Field of study is required"),
	institution: z.string().min(1, "Institution is required"),
	gpa: z.string().default(""),
})

export type TUpsertEducation = z.infer<typeof upsertEducationSchema>

export const deleteEducationSchema = z.object({
	id: z.number(),
})

export const upsertCertificationSchema = z.object({
	id: z.number().optional(),
	userProfileId: z.number(),
	sortOrder: z.number().int().min(0),
	name: z.string().min(1, "Certification name is required"),
	issuer: z.string().min(1, "Issuer is required"),
	issueDate: z.string().nullish(),
	expirationDate: z.string().nullish(),
	url: z.string().nullish(),
})

export type TUpsertCertification = z.infer<typeof upsertCertificationSchema>

export const deleteCertificationSchema = z.object({
	id: z.number(),
})
