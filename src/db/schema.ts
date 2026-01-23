import { sql } from 'drizzle-orm';
// Drizzle ORM schema - single source of truth for DB types
import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const repos = sqliteTable(
  'repos',
  {
    id: integer('id').primaryKey(),
    githubId: integer('github_id').notNull().unique(),
    fullName: text('full_name').notNull(),
    name: text('name').notNull(),
    owner: text('owner').notNull(),
    isPrivate: integer('is_private', { mode: 'boolean' }).notNull().default(false),
    isFork: integer('is_fork', { mode: 'boolean' }).notNull().default(false),
    privacyClass: text('privacy_class', { enum: ['self', 'member-org', 'private', 'external'] }).notNull(),
    defaultBranch: text('default_branch'),
    language: text('language'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
    fetchedAt: text('fetched_at')
      .notNull()
      .default(sql`(datetime('now'))`),
    // Incremental sync state columns
    lastCommitAt: text('last_commit_at'),
    lastPrUpdatedAt: text('last_pr_updated_at'),
    commitsCursor: text('commits_cursor'),
    prsCursor: text('prs_cursor'),
  },
  table => [index('idx_repos_privacy').on(table.privacyClass), index('idx_repos_language').on(table.language)],
);

export const commits = sqliteTable(
  'commits',
  {
    id: integer('id').primaryKey(),
    sha: text('sha').notNull().unique(),
    repoId: integer('repo_id')
      .notNull()
      .references(() => repos.id, { onDelete: 'cascade' }),
    message: text('message').notNull(),
    authorDate: text('author_date').notNull(),
    additions: integer('additions').notNull().default(0),
    deletions: integer('deletions').notNull().default(0),
    filesChanged: integer('files_changed').notNull().default(0),
    languages: text('languages'), // JSON array
    fetchedAt: text('fetched_at')
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  table => [index('idx_commits_repo').on(table.repoId), index('idx_commits_date').on(table.authorDate)],
);

export const pullRequests = sqliteTable(
  'pull_requests',
  {
    id: integer('id').primaryKey(),
    githubId: integer('github_id').notNull().unique(),
    repoId: integer('repo_id')
      .notNull()
      .references(() => repos.id, { onDelete: 'cascade' }),
    number: integer('number').notNull(),
    title: text('title').notNull(),
    body: text('body'),
    state: text('state').notNull(),
    merged: integer('merged', { mode: 'boolean' }).notNull().default(false),
    additions: integer('additions').notNull().default(0),
    deletions: integer('deletions').notNull().default(0),
    changedFiles: integer('changed_files').notNull().default(0),
    commitsCount: integer('commits_count').notNull().default(0),
    commentsCount: integer('comments_count').notNull().default(0),
    reviewCommentsCount: integer('review_comments_count').notNull().default(0),
    createdAt: text('created_at').notNull(),
    mergedAt: text('merged_at'),
    closedAt: text('closed_at'),
    fetchedAt: text('fetched_at')
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  table => [index('idx_prs_repo').on(table.repoId), index('idx_prs_state').on(table.state), index('idx_prs_created').on(table.createdAt)],
);

export const prReviews = sqliteTable(
  'pr_reviews',
  {
    id: integer('id').primaryKey(),
    githubId: integer('github_id').notNull().unique(),
    repoId: integer('repo_id')
      .notNull()
      .references(() => repos.id, { onDelete: 'cascade' }),
    prNumber: integer('pr_number').notNull(),
    prTitle: text('pr_title'),
    state: text('state', { enum: ['APPROVED', 'CHANGES_REQUESTED', 'COMMENTED'] }).notNull(),
    body: text('body'),
    submittedAt: text('submitted_at').notNull(),
    fetchedAt: text('fetched_at')
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  table => [index('idx_reviews_repo').on(table.repoId), index('idx_reviews_submitted').on(table.submittedAt)],
);

export const workflowState = sqliteTable('workflow_state', {
  id: integer('id').primaryKey().default(1),
  phase: text('phase').notNull().default('idle'),
  progressPct: integer('progress_pct').notNull().default(0),
  currentRepo: text('current_repo'),
  reposTotal: integer('repos_total').notNull().default(0),
  reposProcessed: integer('repos_processed').notNull().default(0),
  lastRunAt: text('last_run_at'),
  lastCompletedAt: text('last_completed_at'),
  errorMessage: text('error_message'),
});

export const historySummaries = sqliteTable(
  'history_summaries',
  {
    id: integer('id').primaryKey(),
    summaryType: text('summary_type', { enum: ['commits', 'prs', 'reviews', 'overall'] }).notNull(),
    timeRange: text('time_range').notNull(),
    content: text('content').notNull(),
    tokenEstimate: integer('token_estimate').notNull().default(0),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  table => [uniqueIndex('idx_summaries_type_range').on(table.summaryType, table.timeRange)],
);
