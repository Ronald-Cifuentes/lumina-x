CREATE TABLE `admin_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `admin_sessions_expires_at_idx` ON `admin_sessions` (`expires_at`);--> statement-breakpoint
CREATE TABLE `inquiries` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`property_id` text,
	`full_name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`message` text,
	`preferred_date` text,
	`preferred_time` text,
	`status` text DEFAULT 'nuevo' NOT NULL,
	`consent_at` integer NOT NULL,
	`consent_version` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`property_id`) REFERENCES `properties`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `inquiries_created_at_idx` ON `inquiries` (`created_at`);--> statement-breakpoint
CREATE INDEX `inquiries_property_idx` ON `inquiries` (`property_id`);--> statement-breakpoint
CREATE TABLE `owner_submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`full_name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`property_type` text NOT NULL,
	`municipality` text NOT NULL,
	`neighborhood` text NOT NULL,
	`area_m2` integer NOT NULL,
	`bedrooms` integer NOT NULL,
	`expected_rent` integer NOT NULL,
	`message` text,
	`status` text DEFAULT 'nuevo' NOT NULL,
	`consent_at` integer NOT NULL,
	`consent_version` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `owner_submissions_created_at_idx` ON `owner_submissions` (`created_at`);--> statement-breakpoint
CREATE TABLE `properties` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`municipality` text NOT NULL,
	`zone` text NOT NULL,
	`neighborhood` text NOT NULL,
	`layout` text NOT NULL,
	`area_m2` integer NOT NULL,
	`bedrooms` integer NOT NULL,
	`bathrooms` integer NOT NULL,
	`parking` integer NOT NULL,
	`stratum` integer NOT NULL,
	`floor` integer,
	`monthly_rent` integer NOT NULL,
	`administration_fee` integer,
	`furnished` integer NOT NULL,
	`pets_allowed` integer NOT NULL,
	`availability` text NOT NULL,
	`amenities` text NOT NULL,
	`images` text NOT NULL,
	`summary` text NOT NULL,
	`description` text NOT NULL,
	`featured` integer DEFAULT false NOT NULL,
	`published` integer DEFAULT true NOT NULL,
	`search_text` text NOT NULL,
	`published_at` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `properties_slug_unique` ON `properties` (`slug`);--> statement-breakpoint
CREATE INDEX `properties_zone_idx` ON `properties` (`zone`);--> statement-breakpoint
CREATE INDEX `properties_type_idx` ON `properties` (`type`);--> statement-breakpoint
CREATE INDEX `properties_rent_idx` ON `properties` (`monthly_rent`);--> statement-breakpoint
CREATE INDEX `properties_published_at_idx` ON `properties` (`published_at`);--> statement-breakpoint
CREATE TABLE `rate_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`window_started_at` integer NOT NULL
);
