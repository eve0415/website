// AI Skills Feature Type Definitions
// DB types are inferred from Drizzle schema in #db/types

/** Privacy classification for repositories */
export type PrivacyClass = 'self' | 'member-org' | 'private' | 'external';

/** Hidden organization names - aggregate stats only, never show names */
export const HIDDEN_ORGS = ['DigitaltalPlayground', 'Wideplink'] as const;

/** Workflow state - uses snake_case for API compatibility */
export interface WorkflowState {
  phase: WorkflowPhase;
  progress_pct: number;
  current_repo: string | null;
  repos_total: number;
  repos_processed: number;
  last_run_at: string | null;
  last_completed_at: string | null;
  error_message: string | null;
}

export type WorkflowPhase =
  | 'idle'
  | 'listing-repos'
  | 'fetching-commits'
  | 'fetching-prs'
  | 'fetching-reviews'
  | 'squashing-history'
  | 'ai-extracting-skills'
  | 'ai-generating-japanese'
  | 'storing-results'
  | 'completed'
  | 'error';

/** AI-generated skill with level and description */
export interface AISkill {
  name: string;
  category: 'language' | 'infrastructure' | 'domain';
  level: 'expert' | 'proficient' | 'learning';
  confidence: number; // 0-1, AI confidence in assessment
  description_ja: string; // Japanese description
  evidence: string[]; // Key evidence points (anonymized)
  last_active: string; // ISO date of last relevant activity
  trend: 'rising' | 'stable' | 'declining'; // Activity trend
  is_ai_discovered: boolean; // True if AI found this (not in static list)
}

/** Full AI skills content stored in KV */
export interface AISkillsContent {
  skills: AISkill[];
  generated_at: string;
  model_used: string;
  total_commits_analyzed: number;
  total_prs_analyzed: number;
  total_reviews_analyzed: number;
}

/** AI-generated profile summary stored in KV */
export interface AIProfileSummary {
  summary_ja: string; // Holistic paragraph
  activity_narrative_ja: string; // "This month focused on..."
  skill_comparison_ja: string; // "Strongest in X, growing in Y"
  generated_at: string;
  model_used: string;
}

/** Combined state for frontend */
export interface AISkillsState {
  content: AISkillsContent | null;
  profile: AIProfileSummary | null;
  workflow: WorkflowState;
}

/** GitHub API rate limit info */
export interface RateLimitInfo {
  remaining: number;
  limit: number;
  resetAt: number; // Unix timestamp
}

/** GitHub repository from API */
export interface GitHubRepo {
  id: number;
  full_name: string;
  name: string;
  owner: { login: string };
  private: boolean;
  fork: boolean;
  default_branch: string;
  language: string | null;
  created_at: string;
  updated_at: string;
}

/** GitHub commit from API */
export interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: { date: string };
  };
  stats?: {
    additions: number;
    deletions: number;
  };
  files?: Array<{ filename: string }>;
}

/** GitHub PR from API */
export interface GitHubPR {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: string;
  merged: boolean;
  additions: number;
  deletions: number;
  changed_files: number;
  commits: number;
  comments: number;
  review_comments: number;
  created_at: string;
  merged_at: string | null;
  closed_at: string | null;
}

/** GitHub PR review from API */
export interface GitHubReview {
  id: number;
  state: 'APPROVED' | 'CHANGES_REQUESTED' | 'COMMENTED' | 'PENDING' | 'DISMISSED';
  body: string | null;
  submitted_at: string;
  pull_request_url: string;
}
