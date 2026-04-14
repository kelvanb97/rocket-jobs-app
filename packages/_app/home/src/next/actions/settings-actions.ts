"use server"

import { deleteCertification } from "@rja-api/settings/api/delete-certification"
import { deleteEducation } from "@rja-api/settings/api/delete-education"
import { deleteWorkExperience } from "@rja-api/settings/api/delete-work-experience"
import { extractResume } from "@rja-api/settings/api/extract-resume"
import { getUserProfile } from "@rja-api/settings/api/get-user-profile"
import { upsertCertification } from "@rja-api/settings/api/upsert-certification"
import { upsertEducation } from "@rja-api/settings/api/upsert-education"
import { upsertEeoConfig } from "@rja-api/settings/api/upsert-eeo-config"
import { upsertFormDefaults } from "@rja-api/settings/api/upsert-form-defaults"
import { upsertLlmConfig } from "@rja-api/settings/api/upsert-llm-config"
import { upsertScoringConfig } from "@rja-api/settings/api/upsert-scoring-config"
import { upsertScraperConfig } from "@rja-api/settings/api/upsert-scraper-config"
import { upsertUserProfile } from "@rja-api/settings/api/upsert-user-profile"
import { upsertWorkExperience } from "@rja-api/settings/api/upsert-work-experience"
import { upsertEeoConfigSchema } from "@rja-api/settings/schema/eeo-config-schema"
import { upsertFormDefaultsSchema } from "@rja-api/settings/schema/form-defaults-schema"
import { upsertLlmConfigSchema } from "@rja-api/settings/schema/llm-config-schema"
import { upsertScoringConfigSchema } from "@rja-api/settings/schema/scoring-config-schema"
import { upsertScraperConfigSchema } from "@rja-api/settings/schema/scraper-config-schema"
import {
	deleteCertificationSchema,
	deleteEducationSchema,
	deleteWorkExperienceSchema,
	upsertCertificationSchema,
	upsertEducationSchema,
	upsertUserProfileSchema,
	upsertWorkExperienceSchema,
	type TSeniority,
	type TUpsertUserProfile,
} from "@rja-api/settings/schema/user-profile-schema"
import { actionClient, SafeForClientError } from "@rja-core/next-safe-action"
import { z } from "zod"

export const updateProfileAction = actionClient
	.inputSchema(upsertUserProfileSchema)
	.action(async ({ parsedInput }) => {
		const result = upsertUserProfile(parsedInput)
		if (!result.ok) throw new SafeForClientError(result.error.message)
		return result.data
	})

export const upsertWorkExperienceAction = actionClient
	.inputSchema(upsertWorkExperienceSchema)
	.action(async ({ parsedInput }) => {
		const result = upsertWorkExperience(parsedInput)
		if (!result.ok) throw new SafeForClientError(result.error.message)
		return result.data
	})

export const deleteWorkExperienceAction = actionClient
	.inputSchema(deleteWorkExperienceSchema)
	.action(async ({ parsedInput }) => {
		const result = deleteWorkExperience(parsedInput.id)
		if (!result.ok) throw new SafeForClientError(result.error.message)
		return result.data
	})

export const upsertEducationAction = actionClient
	.inputSchema(upsertEducationSchema)
	.action(async ({ parsedInput }) => {
		const result = upsertEducation(parsedInput)
		if (!result.ok) throw new SafeForClientError(result.error.message)
		return result.data
	})

export const deleteEducationAction = actionClient
	.inputSchema(deleteEducationSchema)
	.action(async ({ parsedInput }) => {
		const result = deleteEducation(parsedInput.id)
		if (!result.ok) throw new SafeForClientError(result.error.message)
		return result.data
	})

export const upsertCertificationAction = actionClient
	.inputSchema(upsertCertificationSchema)
	.action(async ({ parsedInput }) => {
		const result = upsertCertification(parsedInput)
		if (!result.ok) throw new SafeForClientError(result.error.message)
		return result.data
	})

export const deleteCertificationAction = actionClient
	.inputSchema(deleteCertificationSchema)
	.action(async ({ parsedInput }) => {
		const result = deleteCertification(parsedInput.id)
		if (!result.ok) throw new SafeForClientError(result.error.message)
		return result.data
	})

export const updateEeoAction = actionClient
	.inputSchema(upsertEeoConfigSchema)
	.action(async ({ parsedInput }) => {
		const result = upsertEeoConfig(parsedInput)
		if (!result.ok) throw new SafeForClientError(result.error.message)
		return result.data
	})

export const updateFormDefaultsAction = actionClient
	.inputSchema(upsertFormDefaultsSchema)
	.action(async ({ parsedInput }) => {
		const result = upsertFormDefaults(parsedInput)
		if (!result.ok) throw new SafeForClientError(result.error.message)
		return result.data
	})

export const updateScoringConfigAction = actionClient
	.inputSchema(upsertScoringConfigSchema)
	.action(async ({ parsedInput }) => {
		const result = upsertScoringConfig(parsedInput)
		if (!result.ok) throw new SafeForClientError(result.error.message)
		return result.data
	})

export const updateScraperConfigAction = actionClient
	.inputSchema(upsertScraperConfigSchema)
	.action(async ({ parsedInput }) => {
		const result = upsertScraperConfig(parsedInput)
		if (!result.ok) throw new SafeForClientError(result.error.message)
		return result.data
	})

export const updateLlmConfigAction = actionClient
	.inputSchema(upsertLlmConfigSchema)
	.action(async ({ parsedInput }) => {
		const result = upsertLlmConfig(parsedInput)
		if (!result.ok) throw new SafeForClientError(result.error.message)
		return result.data
	})

export const saveAllSettingsAction = actionClient
	.inputSchema(z.object({ json: z.string() }))
	.action(async ({ parsedInput }) => {
		const data = JSON.parse(parsedInput.json)

		// Profile
		const profileResult = upsertUserProfile(data.profile)
		if (!profileResult.ok)
			throw new SafeForClientError(profileResult.error.message)
		const profileId = profileResult.data.id

		// Work experience: delete existing, re-insert from JSON
		const existing = getUserProfile()
		if (existing.ok) {
			for (const exp of existing.data.workExperience) {
				deleteWorkExperience(exp.id)
			}
			for (const edu of existing.data.education) {
				deleteEducation(edu.id)
			}
			for (const cert of existing.data.certifications) {
				deleteCertification(cert.id)
			}
		}

		for (let i = 0; i < (data.workExperience ?? []).length; i++) {
			const exp = data.workExperience[i]
			const result = upsertWorkExperience({
				userProfileId: profileId,
				sortOrder: i,
				company: exp.company,
				title: exp.title,
				startDate: exp.startDate,
				endDate: exp.endDate,
				type: exp.type,
				platforms: exp.platforms ?? [],
				techStack: exp.techStack ?? [],
				summary: exp.summary ?? "",
				highlights: exp.highlights ?? [],
			})
			if (!result.ok) throw new SafeForClientError(result.error.message)
		}

		for (let i = 0; i < (data.education ?? []).length; i++) {
			const edu = data.education[i]
			const result = upsertEducation({
				userProfileId: profileId,
				sortOrder: i,
				degree: edu.degree,
				field: edu.field,
				institution: edu.institution,
			})
			if (!result.ok) throw new SafeForClientError(result.error.message)
		}

		for (let i = 0; i < (data.certifications ?? []).length; i++) {
			const cert = data.certifications[i]
			const result = upsertCertification({
				userProfileId: profileId,
				sortOrder: i,
				name: cert.name,
				issuer: cert.issuer,
				issueDate: cert.issueDate ?? null,
				expirationDate: cert.expirationDate ?? null,
				url: cert.url ?? null,
			})
			if (!result.ok) throw new SafeForClientError(result.error.message)
		}

		if (data.eeo) {
			const result = upsertEeoConfig({
				userProfileId: profileId,
				...data.eeo,
			})
			if (!result.ok) throw new SafeForClientError(result.error.message)
		}

		if (data.formDefaults) {
			const result = upsertFormDefaults({
				userProfileId: profileId,
				...data.formDefaults,
			})
			if (!result.ok) throw new SafeForClientError(result.error.message)
		}

		if (data.scoring) {
			const result = upsertScoringConfig({
				userProfileId: profileId,
				...data.scoring,
			})
			if (!result.ok) throw new SafeForClientError(result.error.message)
		}

		if (data.scraper) {
			const result = upsertScraperConfig({
				userProfileId: profileId,
				...data.scraper,
			})
			if (!result.ok) throw new SafeForClientError(result.error.message)
		}

		return { ok: true }
	})

export const extractResumeAction = actionClient
	.inputSchema(
		z.object({
			fileName: z.string().min(1),
			fileBase64: z.string().min(1),
		}),
	)
	.action(async ({ parsedInput }) => {
		const buffer = Buffer.from(parsedInput.fileBase64, "base64")
		try {
			return await extractResume(parsedInput.fileName, buffer)
		} catch (e) {
			const message = e instanceof Error ? e.message : String(e)
			throw new SafeForClientError(`Resume extraction failed: ${message}`)
		}
	})

export const applyResumeImportAction = actionClient
	.inputSchema(
		z.object({
			profileUpdates: upsertUserProfileSchema.partial(),
			workExperience: z.array(
				upsertWorkExperienceSchema.omit({
					id: true,
					userProfileId: true,
					sortOrder: true,
				}),
			),
			education: z.array(
				upsertEducationSchema.omit({
					id: true,
					userProfileId: true,
					sortOrder: true,
				}),
			),
			certifications: z.array(
				upsertCertificationSchema.omit({
					id: true,
					userProfileId: true,
					sortOrder: true,
				}),
			),
		}),
	)
	.action(async ({ parsedInput }) => {
		const existing = getUserProfile()
		const existingProfile = existing.ok ? existing.data : null

		const merged: TUpsertUserProfile = existingProfile
			? {
					id: existingProfile.id,
					name:
						parsedInput.profileUpdates.name ?? existingProfile.name,
					email:
						parsedInput.profileUpdates.email ??
						existingProfile.email,
					phone:
						parsedInput.profileUpdates.phone ??
						existingProfile.phone,
					linkedin:
						parsedInput.profileUpdates.linkedin ??
						existingProfile.linkedin,
					github:
						parsedInput.profileUpdates.github ??
						existingProfile.github,
					personalWebsite:
						parsedInput.profileUpdates.personalWebsite ??
						existingProfile.personalWebsite,
					location:
						parsedInput.profileUpdates.location ??
						existingProfile.location,
					address:
						parsedInput.profileUpdates.address ??
						existingProfile.address,
					jobTitle:
						parsedInput.profileUpdates.jobTitle ??
						existingProfile.jobTitle,
					seniority:
						parsedInput.profileUpdates.seniority ??
						(existingProfile.seniority as TSeniority),
					yearsOfExperience:
						parsedInput.profileUpdates.yearsOfExperience ??
						existingProfile.yearsOfExperience,
					summary:
						parsedInput.profileUpdates.summary ??
						existingProfile.summary,
					skills:
						parsedInput.profileUpdates.skills ??
						existingProfile.skills,
					preferredSkills:
						parsedInput.profileUpdates.preferredSkills ??
						existingProfile.preferredSkills,
					preferredLocationTypes:
						parsedInput.profileUpdates.preferredLocationTypes ??
						existingProfile.preferredLocationTypes,
					preferredLocations:
						parsedInput.profileUpdates.preferredLocations ??
						existingProfile.preferredLocations,
					salaryMin:
						parsedInput.profileUpdates.salaryMin ??
						existingProfile.salaryMin,
					salaryMax:
						parsedInput.profileUpdates.salaryMax ??
						existingProfile.salaryMax,
					desiredSalary:
						parsedInput.profileUpdates.desiredSalary ??
						existingProfile.desiredSalary,
					startDateWeeksOut:
						parsedInput.profileUpdates.startDateWeeksOut ??
						existingProfile.startDateWeeksOut,
					industries:
						parsedInput.profileUpdates.industries ??
						existingProfile.industries,
					dealbreakers:
						parsedInput.profileUpdates.dealbreakers ??
						existingProfile.dealbreakers,
					notes:
						parsedInput.profileUpdates.notes ??
						existingProfile.notes,
					domainExpertise:
						parsedInput.profileUpdates.domainExpertise ??
						existingProfile.domainExpertise,
				}
			: {
					name: parsedInput.profileUpdates.name ?? "",
					email: parsedInput.profileUpdates.email ?? "",
					phone: parsedInput.profileUpdates.phone ?? "",
					linkedin: parsedInput.profileUpdates.linkedin ?? "",
					github: parsedInput.profileUpdates.github ?? "",
					personalWebsite:
						parsedInput.profileUpdates.personalWebsite ?? "",
					location: parsedInput.profileUpdates.location ?? "",
					address: parsedInput.profileUpdates.address ?? "",
					jobTitle: parsedInput.profileUpdates.jobTitle ?? "",
					seniority: parsedInput.profileUpdates.seniority ?? "mid",
					yearsOfExperience:
						parsedInput.profileUpdates.yearsOfExperience ?? 0,
					summary: parsedInput.profileUpdates.summary ?? "",
					skills: parsedInput.profileUpdates.skills ?? [],
					preferredSkills:
						parsedInput.profileUpdates.preferredSkills ?? [],
					preferredLocationTypes:
						parsedInput.profileUpdates.preferredLocationTypes ?? [],
					preferredLocations:
						parsedInput.profileUpdates.preferredLocations ?? [],
					salaryMin: parsedInput.profileUpdates.salaryMin ?? 0,
					salaryMax: parsedInput.profileUpdates.salaryMax ?? 0,
					desiredSalary:
						parsedInput.profileUpdates.desiredSalary ?? 0,
					startDateWeeksOut:
						parsedInput.profileUpdates.startDateWeeksOut ?? 2,
					industries: parsedInput.profileUpdates.industries ?? [],
					dealbreakers: parsedInput.profileUpdates.dealbreakers ?? [],
					notes: parsedInput.profileUpdates.notes ?? "",
					domainExpertise:
						parsedInput.profileUpdates.domainExpertise ?? [],
				}

		if (!merged.name || !merged.email || !merged.jobTitle) {
			throw new SafeForClientError(
				"Resume is missing a required field (name, email, or job title). Fill these in manually on the Profile tab and try again.",
			)
		}

		const profileResult = upsertUserProfile(merged)
		if (!profileResult.ok)
			throw new SafeForClientError(profileResult.error.message)

		const baseExperienceOrder = existingProfile
			? existingProfile.workExperience.length
			: 0
		for (let i = 0; i < parsedInput.workExperience.length; i++) {
			const exp = parsedInput.workExperience[i]
			if (!exp) continue
			const result = upsertWorkExperience({
				userProfileId: profileResult.data.id,
				sortOrder: baseExperienceOrder + i,
				...exp,
			})
			if (!result.ok) throw new SafeForClientError(result.error.message)
		}

		const baseEducationOrder = existingProfile
			? existingProfile.education.length
			: 0
		for (let i = 0; i < parsedInput.education.length; i++) {
			const edu = parsedInput.education[i]
			if (!edu) continue
			const result = upsertEducation({
				userProfileId: profileResult.data.id,
				sortOrder: baseEducationOrder + i,
				...edu,
			})
			if (!result.ok) throw new SafeForClientError(result.error.message)
		}

		const baseCertificationOrder = existingProfile
			? existingProfile.certifications.length
			: 0
		for (let i = 0; i < parsedInput.certifications.length; i++) {
			const cert = parsedInput.certifications[i]
			if (!cert) continue
			const result = upsertCertification({
				userProfileId: profileResult.data.id,
				sortOrder: baseCertificationOrder + i,
				...cert,
			})
			if (!result.ok) throw new SafeForClientError(result.error.message)
		}

		const freshProfile = getUserProfile()
		if (!freshProfile.ok)
			throw new SafeForClientError(freshProfile.error.message)
		return freshProfile.data
	})
