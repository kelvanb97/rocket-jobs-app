CREATE TABLE `application` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`role_id` integer,
	`status` text DEFAULT 'submitted' NOT NULL,
	`resume_path` text,
	`cover_letter_path` text,
	`screenshot_path` text,
	`submitted_at` integer,
	`created_at` integer,
	`updated_at` integer,
	`notes` text,
	FOREIGN KEY (`role_id`) REFERENCES `role`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_application_role_id` ON `application` (`role_id`);--> statement-breakpoint
CREATE INDEX `idx_application_status` ON `application` (`status`);--> statement-breakpoint
CREATE TABLE `company` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`website` text,
	`linkedin_url` text,
	`size` text,
	`stage` text,
	`industry` text,
	`created_at` integer,
	`updated_at` integer,
	`notes` text
);
--> statement-breakpoint
CREATE INDEX `idx_company_name` ON `company` (`name`);--> statement-breakpoint
CREATE TABLE `interaction` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`role_id` integer,
	`person_id` integer,
	`type` text NOT NULL,
	`notes` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`role_id`) REFERENCES `role`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`person_id`) REFERENCES `person`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_interaction_role_id` ON `interaction` (`role_id`);--> statement-breakpoint
CREATE INDEX `idx_interaction_person_id` ON `interaction` (`person_id`);--> statement-breakpoint
CREATE TABLE `person` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`company_id` integer,
	`name` text NOT NULL,
	`title` text,
	`email` text,
	`linkedin_url` text,
	`created_at` integer,
	`updated_at` integer,
	`notes` text,
	FOREIGN KEY (`company_id`) REFERENCES `company`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_person_company_id` ON `person` (`company_id`);--> statement-breakpoint
CREATE TABLE `role` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`company_id` integer,
	`title` text NOT NULL,
	`url` text,
	`description` text,
	`source` text,
	`location_type` text,
	`location` text,
	`salary_min` integer,
	`salary_max` integer,
	`status` text DEFAULT 'pending' NOT NULL,
	`posted_at` integer,
	`created_at` integer,
	`updated_at` integer,
	`notes` text,
	FOREIGN KEY (`company_id`) REFERENCES `company`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_role_company_id` ON `role` (`company_id`);--> statement-breakpoint
CREATE INDEX `idx_role_status` ON `role` (`status`);--> statement-breakpoint
CREATE INDEX `idx_role_status_created_at` ON `role` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_role_url` ON `role` (`url`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_role_company_id_title` ON `role` (`company_id`,`title`);--> statement-breakpoint
CREATE TABLE `role_person` (
	`role_id` integer NOT NULL,
	`person_id` integer NOT NULL,
	`relationship` text,
	PRIMARY KEY(`role_id`, `person_id`),
	FOREIGN KEY (`role_id`) REFERENCES `role`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`person_id`) REFERENCES `person`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_role_person_role_id` ON `role_person` (`role_id`);--> statement-breakpoint
CREATE INDEX `idx_role_person_person_id` ON `role_person` (`person_id`);--> statement-breakpoint
CREATE TABLE `score` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`role_id` integer,
	`score` integer NOT NULL,
	`positive` text,
	`negative` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`role_id`) REFERENCES `role`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `score_role_id_unique` ON `score` (`role_id`);--> statement-breakpoint
CREATE INDEX `idx_score_role_id` ON `score` (`role_id`);