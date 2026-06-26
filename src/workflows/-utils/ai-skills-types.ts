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

// --- AI output validation ---
// LLM responses are an untrusted boundary: a model can return any shape,
// and unvalidated output propagates into KV and the public UI.

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

/** Shape the skill-extraction model must return (description_ja etc. are added afterwards) */
export type AISkillDraft = Pick<AISkill, 'name' | 'category' | 'level' | 'confidence' | 'evidence' | 'trend'>;

export const isAISkillDraft = (value: unknown): value is AISkillDraft =>
  isRecord(value) &&
  typeof value['name'] === 'string' &&
  (value['category'] === 'language' || value['category'] === 'infrastructure' || value['category'] === 'domain') &&
  (value['level'] === 'expert' || value['level'] === 'proficient' || value['level'] === 'learning') &&
  typeof value['confidence'] === 'number' &&
  Array.isArray(value['evidence']) &&
  value['evidence'].every(item => typeof item === 'string') &&
  (value['trend'] === 'rising' || value['trend'] === 'stable' || value['trend'] === 'declining');

/** Shape the profile model must return */
export type AIProfileDraft = Pick<AIProfileSummary, 'summary_ja' | 'activity_narrative_ja' | 'skill_comparison_ja'>;

export const isAIProfileDraft = (value: unknown): value is AIProfileDraft =>
  isRecord(value) &&
  typeof value['summary_ja'] === 'string' &&
  typeof value['activity_narrative_ja'] === 'string' &&
  typeof value['skill_comparison_ja'] === 'string';

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
