CREATE TABLE `education` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_profile_id` integer NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`degree` text NOT NULL,
	`field` text NOT NULL,
	`institution` text NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`user_profile_id`) REFERENCES `user_profile`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_education_user_profile_id` ON `education` (`user_profile_id`);--> statement-breakpoint
CREATE TABLE `eeo_config` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_profile_id` integer NOT NULL,
	`gender` text,
	`ethnicity` text,
	`veteran_status` text,
	`disability_status` text,
	`work_authorization` text,
	`requires_visa_sponsorship` integer DEFAULT false NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`user_profile_id`) REFERENCES `user_profile`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `eeo_config_user_profile_id_unique` ON `eeo_config` (`user_profile_id`);--> statement-breakpoint
CREATE TABLE `form_defaults` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_profile_id` integer NOT NULL,
	`how_did_you_hear` text DEFAULT '' NOT NULL,
	`referred_by_employee` text DEFAULT 'No' NOT NULL,
	`non_compete_agreement` text DEFAULT 'No' NOT NULL,
	`previously_employed` text DEFAULT 'No' NOT NULL,
	`professional_references` text DEFAULT '' NOT NULL,
	`employment_type` text DEFAULT 'Full-Time' NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`user_profile_id`) REFERENCES `user_profile`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `form_defaults_user_profile_id_unique` ON `form_defaults` (`user_profile_id`);--> statement-breakpoint
CREATE TABLE `scoring_config` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_profile_id` integer NOT NULL,
	`title_and_seniority` text DEFAULT 'high' NOT NULL,
	`skills` text DEFAULT 'high' NOT NULL,
	`salary` text DEFAULT 'high' NOT NULL,
	`location` text DEFAULT 'medium' NOT NULL,
	`industry` text DEFAULT 'low' NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`user_profile_id`) REFERENCES `user_profile`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `scoring_config_user_profile_id_unique` ON `scoring_config` (`user_profile_id`);--> statement-breakpoint
CREATE TABLE `scraper_config` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_profile_id` integer NOT NULL,
	`relevant_keywords` text DEFAULT '[]' NOT NULL,
	`blocked_keywords` text DEFAULT '[]' NOT NULL,
	`blocked_companies` text DEFAULT '[]' NOT NULL,
	`enabled_sources` text DEFAULT '[]' NOT NULL,
	`google_titles` text DEFAULT '[]' NOT NULL,
	`google_remote` integer DEFAULT true NOT NULL,
	`google_full_time_only` integer DEFAULT true NOT NULL,
	`google_freshness_days` integer DEFAULT 3 NOT NULL,
	`google_max_pages` integer DEFAULT 5 NOT NULL,
	`linkedin_urls` text DEFAULT '[]' NOT NULL,
	`linkedin_max_pages` integer DEFAULT 5 NOT NULL,
	`linkedin_max_per_page` integer DEFAULT 25 NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`user_profile_id`) REFERENCES `user_profile`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `scraper_config_user_profile_id_unique` ON `scraper_config` (`user_profile_id`);--> statement-breakpoint
CREATE TABLE `user_profile` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`linkedin` text DEFAULT '' NOT NULL,
	`github` text DEFAULT '' NOT NULL,
	`personal_website` text DEFAULT '' NOT NULL,
	`location` text DEFAULT '' NOT NULL,
	`address` text DEFAULT '' NOT NULL,
	`job_title` text NOT NULL,
	`seniority` text DEFAULT 'mid' NOT NULL,
	`years_of_experience` integer DEFAULT 0 NOT NULL,
	`summary` text DEFAULT '' NOT NULL,
	`skills` text DEFAULT '[]' NOT NULL,
	`preferred_skills` text DEFAULT '[]' NOT NULL,
	`preferred_location_types` text DEFAULT '[]' NOT NULL,
	`preferred_locations` text DEFAULT '[]' NOT NULL,
	`salary_min` integer DEFAULT 0 NOT NULL,
	`salary_max` integer DEFAULT 0 NOT NULL,
	`desired_salary` integer DEFAULT 0 NOT NULL,
	`start_date_weeks_out` integer DEFAULT 2 NOT NULL,
	`industries` text DEFAULT '[]' NOT NULL,
	`dealbreakers` text DEFAULT '[]' NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`domain_expertise` text DEFAULT '[]' NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `work_experience` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_profile_id` integer NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`company` text NOT NULL,
	`title` text NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`type` text DEFAULT 'full-time' NOT NULL,
	`platforms` text DEFAULT '[]' NOT NULL,
	`tech_stack` text DEFAULT '[]' NOT NULL,
	`summary` text DEFAULT '' NOT NULL,
	`highlights` text DEFAULT '[]' NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`user_profile_id`) REFERENCES `user_profile`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_work_experience_user_profile_id` ON `work_experience` (`user_profile_id`);