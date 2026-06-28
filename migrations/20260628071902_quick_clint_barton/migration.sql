PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_commits` (
	`id` integer PRIMARY KEY,
	`sha` text NOT NULL UNIQUE,
	`repo_id` integer NOT NULL,
	`message` text NOT NULL,
	`author_date` text NOT NULL,
	`additions` integer DEFAULT 0 NOT NULL,
	`deletions` integer DEFAULT 0 NOT NULL,
	`files_changed` integer DEFAULT 0 NOT NULL,
	`languages` text,
	`fetched_at` text DEFAULT (datetime('now')) NOT NULL,
	CONSTRAINT `commits_repo_id_repos_id_fk` FOREIGN KEY (`repo_id`) REFERENCES `repos`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
INSERT INTO `__new_commits`(`id`, `sha`, `repo_id`, `message`, `author_date`, `additions`, `deletions`, `files_changed`, `languages`, `fetched_at`) SELECT `id`, `sha`, `repo_id`, `message`, `author_date`, `additions`, `deletions`, `files_changed`, `languages`, `fetched_at` FROM `commits`;--> statement-breakpoint
DROP TABLE `commits`;--> statement-breakpoint
ALTER TABLE `__new_commits` RENAME TO `commits`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_pr_reviews` (
	`id` integer PRIMARY KEY,
	`github_id` integer NOT NULL UNIQUE,
	`repo_id` integer NOT NULL,
	`pr_number` integer NOT NULL,
	`pr_title` text,
	`state` text NOT NULL,
	`body` text,
	`submitted_at` text NOT NULL,
	`fetched_at` text DEFAULT (datetime('now')) NOT NULL,
	CONSTRAINT `pr_reviews_repo_id_repos_id_fk` FOREIGN KEY (`repo_id`) REFERENCES `repos`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
INSERT INTO `__new_pr_reviews`(`id`, `github_id`, `repo_id`, `pr_number`, `pr_title`, `state`, `body`, `submitted_at`, `fetched_at`) SELECT `id`, `github_id`, `repo_id`, `pr_number`, `pr_title`, `state`, `body`, `submitted_at`, `fetched_at` FROM `pr_reviews`;--> statement-breakpoint
DROP TABLE `pr_reviews`;--> statement-breakpoint
ALTER TABLE `__new_pr_reviews` RENAME TO `pr_reviews`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_pull_requests` (
	`id` integer PRIMARY KEY,
	`github_id` integer NOT NULL UNIQUE,
	`repo_id` integer NOT NULL,
	`number` integer NOT NULL,
	`title` text NOT NULL,
	`body` text,
	`state` text NOT NULL,
	`merged` integer DEFAULT false NOT NULL,
	`additions` integer DEFAULT 0 NOT NULL,
	`deletions` integer DEFAULT 0 NOT NULL,
	`changed_files` integer DEFAULT 0 NOT NULL,
	`commits_count` integer DEFAULT 0 NOT NULL,
	`comments_count` integer DEFAULT 0 NOT NULL,
	`review_comments_count` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`merged_at` text,
	`closed_at` text,
	`fetched_at` text DEFAULT (datetime('now')) NOT NULL,
	CONSTRAINT `pull_requests_repo_id_repos_id_fk` FOREIGN KEY (`repo_id`) REFERENCES `repos`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
INSERT INTO `__new_pull_requests`(`id`, `github_id`, `repo_id`, `number`, `title`, `body`, `state`, `merged`, `additions`, `deletions`, `changed_files`, `commits_count`, `comments_count`, `review_comments_count`, `created_at`, `merged_at`, `closed_at`, `fetched_at`) SELECT `id`, `github_id`, `repo_id`, `number`, `title`, `body`, `state`, `merged`, `additions`, `deletions`, `changed_files`, `commits_count`, `comments_count`, `review_comments_count`, `created_at`, `merged_at`, `closed_at`, `fetched_at` FROM `pull_requests`;--> statement-breakpoint
DROP TABLE `pull_requests`;--> statement-breakpoint
ALTER TABLE `__new_pull_requests` RENAME TO `pull_requests`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_repos` (
	`id` integer PRIMARY KEY,
	`github_id` integer NOT NULL UNIQUE,
	`full_name` text NOT NULL,
	`name` text NOT NULL,
	`owner` text NOT NULL,
	`is_private` integer DEFAULT false NOT NULL,
	`is_fork` integer DEFAULT false NOT NULL,
	`privacy_class` text NOT NULL,
	`default_branch` text,
	`language` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`fetched_at` text DEFAULT (datetime('now')) NOT NULL,
	`last_commit_at` text,
	`last_pr_updated_at` text,
	`commits_cursor` text,
	`prs_cursor` text
);
--> statement-breakpoint
INSERT INTO `__new_repos`(`id`, `github_id`, `full_name`, `name`, `owner`, `is_private`, `is_fork`, `privacy_class`, `default_branch`, `language`, `created_at`, `updated_at`, `fetched_at`, `last_commit_at`, `last_pr_updated_at`, `commits_cursor`, `prs_cursor`) SELECT `id`, `github_id`, `full_name`, `name`, `owner`, `is_private`, `is_fork`, `privacy_class`, `default_branch`, `language`, `created_at`, `updated_at`, `fetched_at`, `last_commit_at`, `last_pr_updated_at`, `commits_cursor`, `prs_cursor` FROM `repos`;--> statement-breakpoint
DROP TABLE `repos`;--> statement-breakpoint
ALTER TABLE `__new_repos` RENAME TO `repos`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
DROP INDEX IF EXISTS `commits_sha_unique`;--> statement-breakpoint
DROP INDEX IF EXISTS `pr_reviews_github_id_unique`;--> statement-breakpoint
DROP INDEX IF EXISTS `pull_requests_github_id_unique`;--> statement-breakpoint
DROP INDEX IF EXISTS `repos_github_id_unique`;--> statement-breakpoint
CREATE INDEX `idx_commits_repo` ON `commits` (`repo_id`);--> statement-breakpoint
CREATE INDEX `idx_commits_date` ON `commits` (`author_date`);--> statement-breakpoint
CREATE INDEX `idx_reviews_repo` ON `pr_reviews` (`repo_id`);--> statement-breakpoint
CREATE INDEX `idx_reviews_submitted` ON `pr_reviews` (`submitted_at`);--> statement-breakpoint
CREATE INDEX `idx_prs_repo` ON `pull_requests` (`repo_id`);--> statement-breakpoint
CREATE INDEX `idx_prs_state` ON `pull_requests` (`state`);--> statement-breakpoint
CREATE INDEX `idx_prs_created` ON `pull_requests` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_repos_privacy` ON `repos` (`privacy_class`);--> statement-breakpoint
CREATE INDEX `idx_repos_language` ON `repos` (`language`);