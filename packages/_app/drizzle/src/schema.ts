import {
	index,
	int,
	primaryKey,
	sqliteTable,
	text,
	uniqueIndex,
} from "drizzle-orm/sqlite-core"

// =============================================================
// COMPANY
// =============================================================

export const company = sqliteTable(
	"company",
	{
		id: int("id").primaryKey({ autoIncrement: true }),
		name: text("name").notNull(),
		website: text("website"),
		linkedinUrl: text("linkedin_url"),
		size: text("size"),
		stage: text("stage"),
		industry: text("industry"),
		createdAt: int("created_at", { mode: "timestamp" }).$defaultFn(
			() => new Date(),
		),
		updatedAt: int("updated_at", { mode: "timestamp" })
			.$defaultFn(() => new Date())
			.$onUpdate(() => new Date()),
		notes: text("notes"),
	},
	(table) => [index("idx_company_name").on(table.name)],
)

export type TCompany = typeof company.$inferSelect
export type TNewCompany = typeof company.$inferInsert

// =============================================================
// ROLE
// =============================================================

export const role = sqliteTable(
	"role",
	{
		id: int("id").primaryKey({ autoIncrement: true }),
		companyId: int("company_id").references(() => company.id, {
			onDelete: "cascade",
		}),
		title: text("title").notNull(),
		url: text("url"),
		description: text("description"),
		source: text("source"),
		locationType: text("location_type"),
		location: text("location"),
		salaryMin: int("salary_min"),
		salaryMax: int("salary_max"),
		status: text("status").notNull().default("pending"),
		postedAt: int("posted_at", { mode: "timestamp" }),
		createdAt: int("created_at", { mode: "timestamp" }).$defaultFn(
			() => new Date(),
		),
		updatedAt: int("updated_at", { mode: "timestamp" })
			.$defaultFn(() => new Date())
			.$onUpdate(() => new Date()),
		notes: text("notes"),
	},
	(table) => [
		index("idx_role_company_id").on(table.companyId),
		index("idx_role_status").on(table.status),
		index("idx_role_status_created_at").on(table.status, table.createdAt),
		index("idx_role_url").on(table.url),
		uniqueIndex("idx_role_company_id_title").on(
			table.companyId,
			table.title,
		),
	],
)

export type TRole = typeof role.$inferSelect
export type TNewRole = typeof role.$inferInsert

// =============================================================
// SCORE
// =============================================================

export const score = sqliteTable(
	"score",
	{
		id: int("id").primaryKey({ autoIncrement: true }),
		roleId: int("role_id")
			.unique()
			.references(() => role.id, { onDelete: "cascade" }),
		score: int("score").notNull(),
		positive: text("positive", { mode: "json" }).$type<string[]>(),
		negative: text("negative", { mode: "json" }).$type<string[]>(),
		createdAt: int("created_at", { mode: "timestamp" }).$defaultFn(
			() => new Date(),
		),
		updatedAt: int("updated_at", { mode: "timestamp" })
			.$defaultFn(() => new Date())
			.$onUpdate(() => new Date()),
	},
	(table) => [index("idx_score_role_id").on(table.roleId)],
)

export type TScore = typeof score.$inferSelect
export type TNewScore = typeof score.$inferInsert

// =============================================================
// PERSON
// =============================================================

export const person = sqliteTable(
	"person",
	{
		id: int("id").primaryKey({ autoIncrement: true }),
		companyId: int("company_id").references(() => company.id, {
			onDelete: "set null",
		}),
		name: text("name").notNull(),
		title: text("title"),
		email: text("email"),
		linkedinUrl: text("linkedin_url"),
		createdAt: int("created_at", { mode: "timestamp" }).$defaultFn(
			() => new Date(),
		),
		updatedAt: int("updated_at", { mode: "timestamp" })
			.$defaultFn(() => new Date())
			.$onUpdate(() => new Date()),
		notes: text("notes"),
	},
	(table) => [index("idx_person_company_id").on(table.companyId)],
)

export type TPerson = typeof person.$inferSelect
export type TNewPerson = typeof person.$inferInsert

// =============================================================
// ROLE_PERSON (join table)
// =============================================================

export const rolePerson = sqliteTable(
	"role_person",
	{
		roleId: int("role_id")
			.notNull()
			.references(() => role.id, { onDelete: "cascade" }),
		personId: int("person_id")
			.notNull()
			.references(() => person.id, { onDelete: "cascade" }),
		relationship: text("relationship"),
	},
	(table) => [
		primaryKey({ columns: [table.roleId, table.personId] }),
		index("idx_role_person_role_id").on(table.roleId),
		index("idx_role_person_person_id").on(table.personId),
	],
)

export type TRolePerson = typeof rolePerson.$inferSelect
export type TNewRolePerson = typeof rolePerson.$inferInsert

// =============================================================
// INTERACTION
// =============================================================

export const interaction = sqliteTable(
	"interaction",
	{
		id: int("id").primaryKey({ autoIncrement: true }),
		roleId: int("role_id").references(() => role.id, {
			onDelete: "cascade",
		}),
		personId: int("person_id").references(() => person.id, {
			onDelete: "set null",
		}),
		type: text("type").notNull(),
		notes: text("notes"),
		createdAt: int("created_at", { mode: "timestamp" }).$defaultFn(
			() => new Date(),
		),
		updatedAt: int("updated_at", { mode: "timestamp" })
			.$defaultFn(() => new Date())
			.$onUpdate(() => new Date()),
	},
	(table) => [
		index("idx_interaction_role_id").on(table.roleId),
		index("idx_interaction_person_id").on(table.personId),
	],
)

export type TInteraction = typeof interaction.$inferSelect
export type TNewInteraction = typeof interaction.$inferInsert

// =============================================================
// APPLICATION
// =============================================================

export const application = sqliteTable(
	"application",
	{
		id: int("id").primaryKey({ autoIncrement: true }),
		roleId: int("role_id").references(() => role.id, {
			onDelete: "cascade",
		}),
		status: text("status").notNull().default("submitted"),
		resumePath: text("resume_path"),
		coverLetterPath: text("cover_letter_path"),
		screenshotPath: text("screenshot_path"),
		submittedAt: int("submitted_at", { mode: "timestamp" }).$defaultFn(
			() => new Date(),
		),
		createdAt: int("created_at", { mode: "timestamp" }).$defaultFn(
			() => new Date(),
		),
		updatedAt: int("updated_at", { mode: "timestamp" })
			.$defaultFn(() => new Date())
			.$onUpdate(() => new Date()),
		notes: text("notes"),
	},
	(table) => [
		index("idx_application_role_id").on(table.roleId),
		index("idx_application_status").on(table.status),
	],
)

export type TApplication = typeof application.$inferSelect
export type TNewApplication = typeof application.$inferInsert

// =============================================================
// USER PROFILE
// =============================================================

export const userProfile = sqliteTable("user_profile", {
	id: int("id").primaryKey({ autoIncrement: true }),
	name: text("name").notNull(),
	email: text("email").notNull(),
	phone: text("phone").notNull(),
	links: text("links", { mode: "json" })
		.$type<string[]>()
		.notNull()
		.default([]),
	location: text("location").notNull().default(""),
	address: text("address").notNull().default(""),
	jobTitle: text("job_title").notNull(),
	seniority: text("seniority").notNull().default("mid"),
	yearsOfExperience: int("years_of_experience").notNull().default(0),
	summary: text("summary").notNull().default(""),
	skills: text("skills", { mode: "json" })
		.$type<string[]>()
		.notNull()
		.default([]),
	preferredLocationTypes: text("preferred_location_types", { mode: "json" })
		.$type<string[]>()
		.notNull()
		.default([]),
	preferredLocations: text("preferred_locations", { mode: "json" })
		.$type<string[]>()
		.notNull()
		.default([]),
	salaryMin: int("salary_min").notNull().default(0),
	salaryMax: int("salary_max").notNull().default(0),
	desiredSalary: int("desired_salary").notNull().default(0),
	startDateWeeksOut: int("start_date_weeks_out").notNull().default(2),
	industries: text("industries", { mode: "json" })
		.$type<string[]>()
		.notNull()
		.default([]),
	dealbreakers: text("dealbreakers", { mode: "json" })
		.$type<string[]>()
		.notNull()
		.default([]),
	domainExpertise: text("domain_expertise", { mode: "json" })
		.$type<string[]>()
		.notNull()
		.default([]),
	createdAt: int("created_at", { mode: "timestamp" }).$defaultFn(
		() => new Date(),
	),
	updatedAt: int("updated_at", { mode: "timestamp" })
		.$defaultFn(() => new Date())
		.$onUpdate(() => new Date()),
})

export type TUserProfile = typeof userProfile.$inferSelect
export type TNewUserProfile = typeof userProfile.$inferInsert

// =============================================================
// WORK EXPERIENCE
// =============================================================

export const workExperience = sqliteTable(
	"work_experience",
	{
		id: int("id").primaryKey({ autoIncrement: true }),
		userProfileId: int("user_profile_id")
			.notNull()
			.references(() => userProfile.id, { onDelete: "cascade" }),
		sortOrder: int("sort_order").notNull().default(0),
		company: text("company").notNull(),
		title: text("title").notNull(),
		startDate: text("start_date").notNull(),
		endDate: text("end_date").notNull(),
		type: text("type").notNull().default("full-time"),
		summary: text("summary").notNull().default(""),
		highlights: text("highlights", { mode: "json" })
			.$type<string[]>()
			.notNull()
			.default([]),
		createdAt: int("created_at", { mode: "timestamp" }).$defaultFn(
			() => new Date(),
		),
		updatedAt: int("updated_at", { mode: "timestamp" })
			.$defaultFn(() => new Date())
			.$onUpdate(() => new Date()),
	},
	(table) => [
		index("idx_work_experience_user_profile_id").on(table.userProfileId),
	],
)

export type TWorkExperience = typeof workExperience.$inferSelect
export type TNewWorkExperience = typeof workExperience.$inferInsert

// =============================================================
// EDUCATION
// =============================================================

export const education = sqliteTable(
	"education",
	{
		id: int("id").primaryKey({ autoIncrement: true }),
		userProfileId: int("user_profile_id")
			.notNull()
			.references(() => userProfile.id, { onDelete: "cascade" }),
		sortOrder: int("sort_order").notNull().default(0),
		degree: text("degree").notNull(),
		field: text("field").notNull(),
		institution: text("institution").notNull(),
		gpa: text("gpa").notNull().default(""),
		createdAt: int("created_at", { mode: "timestamp" }).$defaultFn(
			() => new Date(),
		),
		updatedAt: int("updated_at", { mode: "timestamp" })
			.$defaultFn(() => new Date())
			.$onUpdate(() => new Date()),
	},
	(table) => [index("idx_education_user_profile_id").on(table.userProfileId)],
)

export type TEducation = typeof education.$inferSelect
export type TNewEducation = typeof education.$inferInsert

// =============================================================
// CERTIFICATION
// =============================================================

export const certification = sqliteTable(
	"certification",
	{
		id: int("id").primaryKey({ autoIncrement: true }),
		userProfileId: int("user_profile_id")
			.notNull()
			.references(() => userProfile.id, { onDelete: "cascade" }),
		sortOrder: int("sort_order").notNull().default(0),
		name: text("name").notNull(),
		issuer: text("issuer").notNull(),
		issueDate: text("issue_date"),
		expirationDate: text("expiration_date"),
		url: text("url"),
		createdAt: int("created_at", { mode: "timestamp" }).$defaultFn(
			() => new Date(),
		),
		updatedAt: int("updated_at", { mode: "timestamp" })
			.$defaultFn(() => new Date())
			.$onUpdate(() => new Date()),
	},
	(table) => [
		index("idx_certification_user_profile_id").on(table.userProfileId),
	],
)

export type TCertification = typeof certification.$inferSelect
export type TNewCertification = typeof certification.$inferInsert

// =============================================================
// EEO CONFIG
// =============================================================

export const eeoConfig = sqliteTable("eeo_config", {
	id: int("id").primaryKey({ autoIncrement: true }),
	userProfileId: int("user_profile_id")
		.unique()
		.notNull()
		.references(() => userProfile.id, { onDelete: "cascade" }),
	gender: text("gender"),
	ethnicity: text("ethnicity"),
	veteranStatus: text("veteran_status"),
	disabilityStatus: text("disability_status"),
	workAuthorization: text("work_authorization"),
	requiresVisaSponsorship: int("requires_visa_sponsorship", {
		mode: "boolean",
	})
		.notNull()
		.default(false),
	createdAt: int("created_at", { mode: "timestamp" }).$defaultFn(
		() => new Date(),
	),
	updatedAt: int("updated_at", { mode: "timestamp" })
		.$defaultFn(() => new Date())
		.$onUpdate(() => new Date()),
})

export type TEeoConfig = typeof eeoConfig.$inferSelect
export type TNewEeoConfig = typeof eeoConfig.$inferInsert

// =============================================================
// SCORING CONFIG
// =============================================================

export const scoringConfig = sqliteTable("scoring_config", {
	id: int("id").primaryKey({ autoIncrement: true }),
	userProfileId: int("user_profile_id")
		.unique()
		.notNull()
		.references(() => userProfile.id, { onDelete: "cascade" }),
	titleAndSeniority: text("title_and_seniority").notNull().default("high"),
	skills: text("skills").notNull().default("high"),
	salary: text("salary").notNull().default("high"),
	location: text("location").notNull().default("medium"),
	industry: text("industry").notNull().default("low"),
	createdAt: int("created_at", { mode: "timestamp" }).$defaultFn(
		() => new Date(),
	),
	updatedAt: int("updated_at", { mode: "timestamp" })
		.$defaultFn(() => new Date())
		.$onUpdate(() => new Date()),
})

export type TScoringConfig = typeof scoringConfig.$inferSelect
export type TNewScoringConfig = typeof scoringConfig.$inferInsert

// =============================================================
// SCRAPER CONFIG
// =============================================================

export const scraperConfig = sqliteTable("scraper_config", {
	id: int("id").primaryKey({ autoIncrement: true }),
	userProfileId: int("user_profile_id")
		.unique()
		.notNull()
		.references(() => userProfile.id, { onDelete: "cascade" }),
	relevantKeywords: text("relevant_keywords", { mode: "json" })
		.$type<string[]>()
		.notNull()
		.default([]),
	blockedKeywords: text("blocked_keywords", { mode: "json" })
		.$type<string[]>()
		.notNull()
		.default([]),
	blockedCompanies: text("blocked_companies", { mode: "json" })
		.$type<string[]>()
		.notNull()
		.default([]),
	enabledSources: text("enabled_sources", { mode: "json" })
		.$type<string[]>()
		.notNull()
		.default([]),
	linkedinUrls: text("linkedin_urls", { mode: "json" })
		.$type<string[]>()
		.notNull()
		.default([]),
	linkedinMaxPages: int("linkedin_max_pages").notNull().default(5),
	linkedinMaxPerPage: int("linkedin_max_per_page").notNull().default(25),
	createdAt: int("created_at", { mode: "timestamp" }).$defaultFn(
		() => new Date(),
	),
	updatedAt: int("updated_at", { mode: "timestamp" })
		.$defaultFn(() => new Date())
		.$onUpdate(() => new Date()),
})

export type TScraperConfig = typeof scraperConfig.$inferSelect
export type TNewScraperConfig = typeof scraperConfig.$inferInsert

// =============================================================
// LLM CONFIG
// =============================================================

export const llmConfig = sqliteTable("llm_config", {
	id: int("id").primaryKey({ autoIncrement: true }),
	anthropicApiKey: text("anthropic_api_key").notNull().default(""),
	openaiApiKey: text("openai_api_key").notNull().default(""),
	scoringProvider: text("scoring_provider").notNull().default("anthropic"),
	scoringModel: text("scoring_model").notNull(),
	keywordProvider: text("keyword_provider").notNull().default("anthropic"),
	keywordModel: text("keyword_model").notNull(),
	resumeProvider: text("resume_provider").notNull().default("anthropic"),
	resumeModel: text("resume_model").notNull(),
	coverLetterProvider: text("cover_letter_provider")
		.notNull()
		.default("anthropic"),
	coverLetterModel: text("cover_letter_model").notNull(),
	createdAt: int("created_at", { mode: "timestamp" }).$defaultFn(
		() => new Date(),
	),
	updatedAt: int("updated_at", { mode: "timestamp" })
		.$defaultFn(() => new Date())
		.$onUpdate(() => new Date()),
})

export type TLlmConfig = typeof llmConfig.$inferSelect
export type TNewLlmConfig = typeof llmConfig.$inferInsert
