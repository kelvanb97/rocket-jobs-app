"use server"

import { deleteEducation } from "@rja-api/settings/api/delete-education"
import { deleteWorkExperience } from "@rja-api/settings/api/delete-work-experience"
import { getUserProfile } from "@rja-api/settings/api/get-user-profile"
import { upsertEducation } from "@rja-api/settings/api/upsert-education"
import { upsertEeoConfig } from "@rja-api/settings/api/upsert-eeo-config"
import { upsertFormDefaults } from "@rja-api/settings/api/upsert-form-defaults"
import { upsertScoringConfig } from "@rja-api/settings/api/upsert-scoring-config"
import { upsertScraperConfig } from "@rja-api/settings/api/upsert-scraper-config"
import { upsertUserProfile } from "@rja-api/settings/api/upsert-user-profile"
import { upsertWorkExperience } from "@rja-api/settings/api/upsert-work-experience"
import { upsertEeoConfigSchema } from "@rja-api/settings/schema/eeo-config-schema"
import { upsertFormDefaultsSchema } from "@rja-api/settings/schema/form-defaults-schema"
import { upsertScoringConfigSchema } from "@rja-api/settings/schema/scoring-config-schema"
import { upsertScraperConfigSchema } from "@rja-api/settings/schema/scraper-config-schema"
import {
	deleteEducationSchema,
	deleteWorkExperienceSchema,
	upsertEducationSchema,
	upsertUserProfileSchema,
	upsertWorkExperienceSchema,
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
			if (!result.ok)
				throw new SafeForClientError(result.error.message)
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
			if (!result.ok)
				throw new SafeForClientError(result.error.message)
		}

		if (data.eeo) {
			const result = upsertEeoConfig({
				userProfileId: profileId,
				...data.eeo,
			})
			if (!result.ok)
				throw new SafeForClientError(result.error.message)
		}

		if (data.formDefaults) {
			const result = upsertFormDefaults({
				userProfileId: profileId,
				...data.formDefaults,
			})
			if (!result.ok)
				throw new SafeForClientError(result.error.message)
		}

		if (data.scoring) {
			const result = upsertScoringConfig({
				userProfileId: profileId,
				...data.scoring,
			})
			if (!result.ok)
				throw new SafeForClientError(result.error.message)
		}

		if (data.scraper) {
			const result = upsertScraperConfig({
				userProfileId: profileId,
				...data.scraper,
			})
			if (!result.ok)
				throw new SafeForClientError(result.error.message)
		}

		return { ok: true }
	})
