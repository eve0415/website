CREATE TABLE `commits` (
	`id` integer PRIMARY KEY NOT NULL,
	`sha` text NOT NULL,
	`repo_id` integer NOT NULL,
	`message` text NOT NULL,
	`author_date` text NOT NULL,
	`additions` integer DEFAULT 0 NOT NULL,
	`deletions` integer DEFAULT 0 NOT NULL,
	`files_changed` integer DEFAULT 0 NOT NULL,
	`languages` text,
	`fetched_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`repo_id`) REFERENCES `repos`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `commits_sha_unique` ON `commits` (`sha`);--> statement-breakpoint
CREATE INDEX `idx_commits_repo` ON `commits` (`repo_id`);--> statement-breakpoint
CREATE INDEX `idx_commits_date` ON `commits` (`author_date`);--> statement-breakpoint
CREATE TABLE `history_summaries` (
	`id` integer PRIMARY KEY NOT NULL,
	`summary_type` text NOT NULL,
	`time_range` text NOT NULL,
	`content` text NOT NULL,
	`token_estimate` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_summaries_type_range` ON `history_summaries` (`summary_type`,`time_range`);--> statement-breakpoint
CREATE TABLE `pr_reviews` (
	`id` integer PRIMARY KEY NOT NULL,
	`github_id` integer NOT NULL,
	`repo_id` integer NOT NULL,
	`pr_number` integer NOT NULL,
	`pr_title` text,
	`state` text NOT NULL,
	`body` text,
	`submitted_at` text NOT NULL,
	`fetched_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`repo_id`) REFERENCES `repos`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pr_reviews_github_id_unique` ON `pr_reviews` (`github_id`);--> statement-breakpoint
CREATE INDEX `idx_reviews_repo` ON `pr_reviews` (`repo_id`);--> statement-breakpoint
CREATE INDEX `idx_reviews_submitted` ON `pr_reviews` (`submitted_at`);--> statement-breakpoint
CREATE TABLE `pull_requests` (
	`id` integer PRIMARY KEY NOT NULL,
	`github_id` integer NOT NULL,
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
	FOREIGN KEY (`repo_id`) REFERENCES `repos`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pull_requests_github_id_unique` ON `pull_requests` (`github_id`);--> statement-breakpoint
CREATE INDEX `idx_prs_repo` ON `pull_requests` (`repo_id`);--> statement-breakpoint
CREATE INDEX `idx_prs_state` ON `pull_requests` (`state`);--> statement-breakpoint
CREATE INDEX `idx_prs_created` ON `pull_requests` (`created_at`);--> statement-breakpoint
CREATE TABLE `repos` (
	`id` integer PRIMARY KEY NOT NULL,
	`github_id` integer NOT NULL,
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
	`fetched_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `repos_github_id_unique` ON `repos` (`github_id`);--> statement-breakpoint
CREATE INDEX `idx_repos_privacy` ON `repos` (`privacy_class`);--> statement-breakpoint
CREATE INDEX `idx_repos_language` ON `repos` (`language`);--> statement-breakpoint
CREATE TABLE `workflow_state` (
	`id` integer PRIMARY KEY DEFAULT 1 NOT NULL,
	`phase` text DEFAULT 'idle' NOT NULL,
	`progress_pct` integer DEFAULT 0 NOT NULL,
	`current_repo` text,
	`repos_total` integer DEFAULT 0 NOT NULL,
	`repos_processed` integer DEFAULT 0 NOT NULL,
	`last_run_at` text,
	`last_completed_at` text,
	`error_message` text
);
