import type * as schema from './schema';
// Inferred types from Drizzle schema - single source of truth
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';

// Select types (for reading)
export type Repo = InferSelectModel<typeof schema.repos>;
export type Commit = InferSelectModel<typeof schema.commits>;
export type PullRequest = InferSelectModel<typeof schema.pullRequests>;
export type PRReview = InferSelectModel<typeof schema.prReviews>;
export type WorkflowState = InferSelectModel<typeof schema.workflowState>;
export type HistorySummary = InferSelectModel<typeof schema.historySummaries>;

// Insert types (for writing)
export type NewRepo = InferInsertModel<typeof schema.repos>;
export type NewCommit = InferInsertModel<typeof schema.commits>;
export type NewPullRequest = InferInsertModel<typeof schema.pullRequests>;
export type NewPRReview = InferInsertModel<typeof schema.prReviews>;
