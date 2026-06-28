import { sql } from 'drizzle-orm';
import { index, integer, snakeCase, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const repos = snakeCase.table(
  'repos',
  {
    id: integer().primaryKey(),
    githubId: integer().notNull().unique(),
    fullName: text().notNull(),
    name: text().notNull(),
    owner: text().notNull(),
    isPrivate: integer({ mode: 'boolean' }).notNull().default(false),
    isFork: integer({ mode: 'boolean' }).notNull().default(false),
    privacyClass: text({ enum: ['self', 'member-org', 'private', 'external'] }).notNull(),
    defaultBranch: text(),
    language: text(),
    createdAt: text().notNull(),
    updatedAt: text().notNull(),
    fetchedAt: text()
      .notNull()
      .default(sql`(datetime('now'))`),
    lastCommitAt: text(),
    lastPrUpdatedAt: text(),
    commitsCursor: text(),
    prsCursor: text(),
  },
  table => [index('idx_repos_privacy').on(table.privacyClass), index('idx_repos_language').on(table.language)],
);

export const commits = snakeCase.table(
  'commits',
  {
    id: integer().primaryKey(),
    sha: text().notNull().unique(),
    repoId: integer()
      .notNull()
      .references(() => repos.id, { onDelete: 'cascade' }),
    message: text().notNull(),
    authorDate: text().notNull(),
    additions: integer().notNull().default(0),
    deletions: integer().notNull().default(0),
    filesChanged: integer().notNull().default(0),
    languages: text(),
    fetchedAt: text()
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  table => [index('idx_commits_repo').on(table.repoId), index('idx_commits_date').on(table.authorDate)],
);

export const pullRequests = snakeCase.table(
  'pull_requests',
  {
    id: integer().primaryKey(),
    githubId: integer().notNull().unique(),
    repoId: integer()
      .notNull()
      .references(() => repos.id, { onDelete: 'cascade' }),
    number: integer().notNull(),
    title: text().notNull(),
    body: text(),
    state: text().notNull(),
    merged: integer({ mode: 'boolean' }).notNull().default(false),
    additions: integer().notNull().default(0),
    deletions: integer().notNull().default(0),
    changedFiles: integer().notNull().default(0),
    commitsCount: integer().notNull().default(0),
    commentsCount: integer().notNull().default(0),
    reviewCommentsCount: integer().notNull().default(0),
    createdAt: text().notNull(),
    mergedAt: text(),
    closedAt: text(),
    fetchedAt: text()
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  table => [index('idx_prs_repo').on(table.repoId), index('idx_prs_state').on(table.state), index('idx_prs_created').on(table.createdAt)],
);

export const prReviews = snakeCase.table(
  'pr_reviews',
  {
    id: integer().primaryKey(),
    githubId: integer().notNull().unique(),
    repoId: integer()
      .notNull()
      .references(() => repos.id, { onDelete: 'cascade' }),
    prNumber: integer().notNull(),
    prTitle: text(),
    state: text({ enum: ['APPROVED', 'CHANGES_REQUESTED', 'COMMENTED'] }).notNull(),
    body: text(),
    submittedAt: text().notNull(),
    fetchedAt: text()
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  table => [index('idx_reviews_repo').on(table.repoId), index('idx_reviews_submitted').on(table.submittedAt)],
);

export const workflowState = snakeCase.table('workflow_state', {
  id: integer().primaryKey().default(1),
  phase: text().notNull().default('idle'),
  progressPct: integer().notNull().default(0),
  currentRepo: text(),
  reposTotal: integer().notNull().default(0),
  reposProcessed: integer().notNull().default(0),
  lastRunAt: text(),
  lastCompletedAt: text(),
  errorMessage: text(),
});

export const historySummaries = snakeCase.table(
  'history_summaries',
  {
    id: integer().primaryKey(),
    summaryType: text({ enum: ['commits', 'prs', 'reviews', 'overall'] }).notNull(),
    timeRange: text().notNull(),
    content: text().notNull(),
    tokenEstimate: integer().notNull().default(0),
    createdAt: text()
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  table => [uniqueIndex('idx_summaries_type_range').on(table.summaryType, table.timeRange)],
);
