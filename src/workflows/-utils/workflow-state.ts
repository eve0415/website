// Shared mapping between the D1 workflow_state row (camelCase) and the
// snake_case WorkflowState wire shape consumed by the /skills UI.
// Both the workflow (writer) and the loader (reader) go through this module
// so the two sides cannot drift.

import type { workflowState } from '#db/schema';
import type { WorkflowPhase, WorkflowState } from './ai-skills-types';

type WorkflowStateRow = typeof workflowState.$inferSelect;

const WORKFLOW_PHASES: Record<WorkflowPhase, true> = {
  idle: true,
  'listing-repos': true,
  'fetching-commits': true,
  'fetching-prs': true,
  'fetching-reviews': true,
  'squashing-history': true,
  'ai-extracting-skills': true,
  'ai-generating-japanese': true,
  'storing-results': true,
  completed: true,
  error: true,
};

export const isWorkflowPhase = (value: unknown): value is WorkflowPhase => typeof value === 'string' && value in WORKFLOW_PHASES;

export const DEFAULT_WORKFLOW_STATE: WorkflowState = {
  phase: 'idle',
  progress_pct: 0,
  current_repo: null,
  repos_total: 0,
  repos_processed: 0,
  last_run_at: null,
  last_completed_at: null,
  error_message: null,
};

export const mapWorkflowStateRow = (row: WorkflowStateRow): WorkflowState => ({
  phase: isWorkflowPhase(row.phase) ? row.phase : 'idle',
  progress_pct: row.progressPct,
  current_repo: row.currentRepo ?? null,
  repos_total: row.reposTotal,
  repos_processed: row.reposProcessed,
  last_run_at: row.lastRunAt ?? null,
  last_completed_at: row.lastCompletedAt ?? null,
  error_message: row.errorMessage ?? null,
});

// The workflow state changes while a run is in progress, so the KV snapshot
// must stay short-lived or the UI shows stale progress for hours
export const WORKFLOW_STATE_KV_KEY = 'ai_skills_state';
export const WORKFLOW_STATE_KV_TTL_SECONDS = 60;
