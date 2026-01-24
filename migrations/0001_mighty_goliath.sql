ALTER TABLE `repos` ADD `last_commit_at` text;--> statement-breakpoint
ALTER TABLE `repos` ADD `last_pr_updated_at` text;--> statement-breakpoint
ALTER TABLE `repos` ADD `commits_cursor` text;--> statement-breakpoint
ALTER TABLE `repos` ADD `prs_cursor` text;