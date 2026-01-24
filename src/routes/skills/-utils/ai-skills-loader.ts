// Server function to load AI skills data from KV

import type { AIProfileSummary, AISkillsContent, AISkillsState, WorkflowState } from '#workflows/-utils/ai-skills-types';

import { createServerFn } from '@tanstack/react-start';
import { env } from 'cloudflare:workers';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';

import * as schema from '#db/schema';
import { workflowState } from '#db/schema';

type DB = ReturnType<typeof drizzle<typeof schema>>;

// Exported handlers for testing - separated from server function wrappers

/**
 * Handler: Load AI-generated skills content from KV
 */
export async function loadAISkillsContentHandler(kv: KVNamespace): Promise<AISkillsContent | null> {
  return await kv.get<AISkillsContent>('ai_skills_content_ja', 'json');
}

/**
 * Handler: Load AI-generated profile summary from KV
 */
export async function loadAIProfileSummaryHandler(kv: KVNamespace): Promise<AIProfileSummary | null> {
  return await kv.get<AIProfileSummary>('ai_profile_summary_ja', 'json');
}

/**
 * Handler: Load workflow state from KV (cached) or D1 (fresh)
 */
export async function loadWorkflowStateHandler(kv: KVNamespace, db: DB): Promise<WorkflowState> {
  // Try KV cache first
  const cached = await kv.get<WorkflowState>('ai_skills_state', 'json');
  if (cached) {
    return cached;
  }

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
  return {
    phase: state.phase as WorkflowState['phase'],
    progress_pct: state.progressPct,
    current_repo: state.currentRepo,
    repos_total: state.reposTotal,
    repos_processed: state.reposProcessed,
    last_run_at: state.lastRunAt,
    last_completed_at: state.lastCompletedAt,
    error_message: state.errorMessage,
  };
}

/**
 * Handler: Load complete AI skills state (content + profile + workflow)
 */
export async function loadAISkillsStateHandler(kv: KVNamespace, db: DB): Promise<AISkillsState> {
  const [content, profile, workflow] = await Promise.all([
    kv.get<AISkillsContent>('ai_skills_content_ja', 'json'),
    kv.get<AIProfileSummary>('ai_profile_summary_ja', 'json'),
    kv.get<WorkflowState>('ai_skills_state', 'json'),
  ]);

  // Get fresh workflow state from D1 if not cached
  let workflowResult = workflow;
  if (!workflowResult) {
    const dbState = await db.select().from(workflowState).where(eq(workflowState.id, 1)).get();

    if (dbState) {
      workflowResult = {
        phase: dbState.phase as WorkflowState['phase'],
        progress_pct: dbState.progressPct,
        current_repo: dbState.currentRepo,
        repos_total: dbState.reposTotal,
        repos_processed: dbState.reposProcessed,
        last_run_at: dbState.lastRunAt,
        last_completed_at: dbState.lastCompletedAt,
        error_message: dbState.errorMessage,
      };
    } else {
      workflowResult = {
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

  return {
    content,
    profile,
    workflow: workflowResult,
  };
}

/**
 * Handler: Manually trigger the skills analysis workflow
 */
export async function triggerSkillsAnalysisHandler(
  db: DB,
  workflowBinding: { create: () => Promise<unknown> },
): Promise<{ success: boolean; message: string }> {
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
        errorMessage: null,
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
}

// Helper to create DB instance from D1 binding
export function createDB(d1: D1Database): DB {
  return drizzle(d1, { schema, casing: 'snake_case' });
}

// Server functions wrapping the handlers

/**
 * Load AI-generated skills content from KV
 */
export const loadAISkillsContent = createServerFn().handler(async (): Promise<AISkillsContent | null> => {
  return loadAISkillsContentHandler(env.CACHE);
});

/**
 * Load AI-generated profile summary from KV
 */
export const loadAIProfileSummary = createServerFn().handler(async (): Promise<AIProfileSummary | null> => {
  return loadAIProfileSummaryHandler(env.CACHE);
});

/**
 * Load workflow state from KV (cached) or D1 (fresh)
 */
export const loadWorkflowState = createServerFn().handler(async ({ context: { db } }): Promise<WorkflowState> => {
  return loadWorkflowStateHandler(env.CACHE, db);
});

/**
 * Load complete AI skills state (content + profile + workflow)
 */
export const loadAISkillsState = createServerFn().handler(async ({ context: { db } }): Promise<AISkillsState> => {
  return loadAISkillsStateHandler(env.CACHE, db);
});

/**
 * Manually trigger the skills analysis workflow
 * Protected - only works in development or with proper auth
 */
export const triggerSkillsAnalysis = createServerFn().handler(async ({ context: { db } }): Promise<{ success: boolean; message: string }> => {
  return triggerSkillsAnalysisHandler(db, env.SKILLS_WORKFLOW);
});
