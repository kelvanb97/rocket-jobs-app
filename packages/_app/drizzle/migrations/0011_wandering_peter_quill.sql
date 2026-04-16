ALTER TABLE `user_profile` ADD `links` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `user_profile` DROP COLUMN `linkedin`;--> statement-breakpoint
ALTER TABLE `user_profile` DROP COLUMN `github`;--> statement-breakpoint
ALTER TABLE `user_profile` DROP COLUMN `personal_website`;