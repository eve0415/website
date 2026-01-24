import type { WorkflowState } from '#workflows/-utils/ai-skills-types';

export const idleState: WorkflowState = {
  phase: 'idle',
  progress_pct: 0,
  current_repo: null,
  repos_total: 0,
  repos_processed: 0,
  last_run_at: null,
  last_completed_at: null,
  error_message: null,
};

export const listingReposState: WorkflowState = {
  phase: 'listing-repos',
  progress_pct: 5,
  current_repo: null,
  repos_total: 0,
  repos_processed: 0,
  last_run_at: '2024-01-15T10:00:00Z',
  last_completed_at: null,
  error_message: null,
};

export const fetchingCommitsState: WorkflowState = {
  phase: 'fetching-commits',
  progress_pct: 25,
  current_repo: 'eve0415/website',
  repos_total: 10,
  repos_processed: 2,
  last_run_at: '2024-01-15T10:00:00Z',
  last_completed_at: null,
  error_message: null,
};

export const fetchingPRsState: WorkflowState = {
  phase: 'fetching-prs',
  progress_pct: 40,
  current_repo: 'eve0415/discord-bot',
  repos_total: 10,
  repos_processed: 4,
  last_run_at: '2024-01-15T10:00:00Z',
  last_completed_at: null,
  error_message: null,
};

export const fetchingReviewsState: WorkflowState = {
  phase: 'fetching-reviews',
  progress_pct: 55,
  current_repo: 'eve0415/api-server',
  repos_total: 10,
  repos_processed: 5,
  last_run_at: '2024-01-15T10:00:00Z',
  last_completed_at: null,
  error_message: null,
};

export const squashingHistoryState: WorkflowState = {
  phase: 'squashing-history',
  progress_pct: 70,
  current_repo: null,
  repos_total: 10,
  repos_processed: 10,
  last_run_at: '2024-01-15T10:00:00Z',
  last_completed_at: null,
  error_message: null,
};

export const aiExtractingSkillsState: WorkflowState = {
  phase: 'ai-extracting-skills',
  progress_pct: 80,
  current_repo: null,
  repos_total: 10,
  repos_processed: 10,
  last_run_at: '2024-01-15T10:00:00Z',
  last_completed_at: null,
  error_message: null,
};

export const aiGeneratingJapaneseState: WorkflowState = {
  phase: 'ai-generating-japanese',
  progress_pct: 90,
  current_repo: null,
  repos_total: 10,
  repos_processed: 10,
  last_run_at: '2024-01-15T10:00:00Z',
  last_completed_at: null,
  error_message: null,
};

export const storingResultsState: WorkflowState = {
  phase: 'storing-results',
  progress_pct: 95,
  current_repo: null,
  repos_total: 10,
  repos_processed: 10,
  last_run_at: '2024-01-15T10:00:00Z',
  last_completed_at: null,
  error_message: null,
};

export const completedState: WorkflowState = {
  phase: 'completed',
  progress_pct: 100,
  current_repo: null,
  repos_total: 10,
  repos_processed: 10,
  last_run_at: '2024-01-15T10:00:00Z',
  last_completed_at: '2024-01-15T10:05:00Z',
  error_message: null,
};

export const errorState: WorkflowState = {
  phase: 'error',
  progress_pct: 45,
  current_repo: 'eve0415/website',
  repos_total: 10,
  repos_processed: 4,
  last_run_at: '2024-01-15T10:00:00Z',
  last_completed_at: null,
  error_message: 'Rate limit exceeded. Please try again later.',
};
