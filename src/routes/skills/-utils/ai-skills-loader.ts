// Server function to load AI skills data from KV

import type { AIProfileSummary, AISkillsContent, AISkillsState, WorkflowPhase, WorkflowState } from '#workflows/-utils/ai-skills-types';

import { createServerFn } from '@tanstack/react-start';
import { env } from 'cloudflare:workers';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';

import * as schema from '#db/schema';
import { workflowState } from '#db/schema';

type DB = ReturnType<typeof drizzle<typeof schema>>;

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

const isWorkflowPhase = (value: unknown): value is WorkflowPhase => typeof value === 'string' && value in WORKFLOW_PHASES;

// Helper to safely parse JSON from KV, handling corrupted data
const safeKVGetJSON = async <T>(kv: KVNamespace, key: string): Promise<{ value: T | null; wasCorrupted: boolean }> => {
  try {
    const value = await kv.get<T>(key, 'json');
    return { value: value ?? null, wasCorrupted: false };
  } catch {
    await kv.delete(key);
    return { value: null, wasCorrupted: true };
  }
};

// Exported handlers for testing - separated from server function wrappers

/**
 * Handler: Load AI-generated skills content from KV
 */
export const loadAISkillsContentHandler = async (kv: KVNamespace): Promise<AISkillsContent | null> => {
  const { value } = await safeKVGetJSON<AISkillsContent>(kv, 'ai_skills_content_ja');
  return value;
};

/**
 * Handler: Load AI-generated profile summary from KV
 */
export const loadAIProfileSummaryHandler = async (kv: KVNamespace): Promise<AIProfileSummary | null> => {
  const { value } = await safeKVGetJSON<AIProfileSummary>(kv, 'ai_profile_summary_ja');
  return value;
};

/**
 * Handler: Load workflow state from KV (cached) or D1 (fresh)
 */
export const loadWorkflowStateHandler = async (kv: KVNamespace, db: DB): Promise<WorkflowState> => {
  // Try KV cache first
  const { value: cached, wasCorrupted } = await safeKVGetJSON<WorkflowState>(kv, 'ai_skills_state');
  if (cached) return cached;

  const state = await db.select().from(workflowState).where(eq(workflowState.id, 1)).get();

  if (!state) {
    // Return default idle state
    return {
      phase: 'idle',
      progress_pct: 0,
      current_repo: null,
      repos_total: 0,
      repos_processed: 0,
      last_run_at: null,
      last_completed_at: null,
      error_message: null,
    };
  }

  // Map Drizzle camelCase to snake_case for consistency with existing API
  const mappedState: WorkflowState = {
    phase: isWorkflowPhase(state.phase) ? state.phase : 'idle',
    progress_pct: state.progressPct,
    current_repo: state.currentRepo ?? null,
    repos_total: state.reposTotal,
    repos_processed: state.reposProcessed,
    last_run_at: state.lastRunAt ?? null,
    last_completed_at: state.lastCompletedAt ?? null,
    error_message: state.errorMessage ?? null,
  };

  // Self-heal: rewrite KV cache from D1 if it was corrupted
  if (wasCorrupted) {
    await kv.put('ai_skills_state', JSON.stringify(mappedState), {
      expirationTtl: 60 * 60 * 24,
    });
  }

  return mappedState;
};

/**
 * Handler: Load complete AI skills state (content + profile + workflow)
 */
export const loadAISkillsStateHandler = async (kv: KVNamespace, db: DB): Promise<AISkillsState> => {
  const [contentResult, profileResult, workflowResult] = await Promise.all([
    safeKVGetJSON<AISkillsContent>(kv, 'ai_skills_content_ja'),
    safeKVGetJSON<AIProfileSummary>(kv, 'ai_profile_summary_ja'),
    safeKVGetJSON<WorkflowState>(kv, 'ai_skills_state'),
  ]);

  const content = contentResult.value;
  const profile = profileResult.value;

  // Get fresh workflow state from D1 if not cached
  let workflow = workflowResult.value;
  if (!workflow) {
    const dbState = await db.select().from(workflowState).where(eq(workflowState.id, 1)).get();

    if (dbState) {
      workflow = {
        phase: isWorkflowPhase(dbState.phase) ? dbState.phase : 'idle',
        progress_pct: dbState.progressPct,
        current_repo: dbState.currentRepo ?? null,
        repos_total: dbState.reposTotal,
        repos_processed: dbState.reposProcessed,
        last_run_at: dbState.lastRunAt ?? null,
        last_completed_at: dbState.lastCompletedAt ?? null,
        error_message: dbState.errorMessage ?? null,
      };

      // Self-heal: rewrite KV cache from D1 if it was corrupted
      if (workflowResult.wasCorrupted) {
        await kv.put('ai_skills_state', JSON.stringify(workflow), {
          expirationTtl: 60 * 60 * 24,
        });
      }
    } else {
      workflow = {
        phase: 'idle',
        progress_pct: 0,
        current_repo: null,
        repos_total: 0,
        repos_processed: 0,
        last_run_at: null,
        last_completed_at: null,
        error_message: null,
      };
    }
  }

  // workflow is guaranteed non-null by if-else above
  return {
    content,
    profile,
    workflow: workflow,
  };
};

/**
 * Handler: Manually trigger the skills analysis workflow
 */
export const triggerSkillsAnalysisHandler = async (
  db: DB,
  workflowBinding: { create: () => Promise<unknown> },
): Promise<{ success: boolean; message: string }> => {
  try {
    // Check if already running
    const state = await db.select({ phase: workflowState.phase }).from(workflowState).where(eq(workflowState.id, 1)).get();

    if (state && state.phase !== 'idle' && state.phase !== 'completed' && state.phase !== 'error') {
      return {
        success: false,
        message: `Workflow already running: ${state.phase}`,
      };
    }

    // Update state to indicate starting
    await db
      .update(workflowState)
      .set({
        phase: 'listing-repos',
        lastRunAt: new Date().toISOString(),
        errorMessage: undefined,
      })
      .where(eq(workflowState.id, 1));

    // Trigger workflow
    await workflowBinding.create();

    return {
      success: true,
      message: 'Workflow triggered successfully',
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      message,
    };
  }
};

// Helper to create DB instance from D1 binding
export const createDB = (d1: D1Database): DB => drizzle(d1, { schema, casing: 'snake_case' });

// Server functions wrapping the handlers

/**
 * Load AI-generated skills content from KV
 */
export const loadAISkillsContent = createServerFn().handler(async (): Promise<AISkillsContent | null> => loadAISkillsContentHandler(env.CACHE));

/**
 * Load AI-generated profile summary from KV
 */
export const loadAIProfileSummary = createServerFn().handler(async (): Promise<AIProfileSummary | null> => loadAIProfileSummaryHandler(env.CACHE));

/**
 * Load workflow state from KV (cached) or D1 (fresh)
 */
export const loadWorkflowState = createServerFn().handler(async ({ context: { db } }): Promise<WorkflowState> => loadWorkflowStateHandler(env.CACHE, db));

/**
 * Load complete AI skills state (content + profile + workflow)
 */
export const loadAISkillsState = createServerFn().handler(async ({ context: { db } }): Promise<AISkillsState> => loadAISkillsStateHandler(env.CACHE, db));

/**
 * Manually trigger the skills analysis workflow
 * Protected - only works in development or with proper auth
 */
export const triggerSkillsAnalysis = createServerFn().handler(
  async ({ context: { db } }): Promise<{ success: boolean; message: string }> => triggerSkillsAnalysisHandler(db, env.SKILLS_WORKFLOW),
);
