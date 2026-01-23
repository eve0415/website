// Server function to load AI skills data from KV

import type { AIProfileSummary, AISkillsContent, AISkillsState, WorkflowState } from '#workflows/-utils/ai-skills-types';

import { createServerFn } from '@tanstack/react-start';
import { env } from 'cloudflare:workers';
import { eq } from 'drizzle-orm';

import { workflowState } from '#db/schema';

/**
 * Load AI-generated skills content from KV
 */
export const loadAISkillsContent = createServerFn().handler(async (): Promise<AISkillsContent | null> => {
  const content = await env.CACHE.get<AISkillsContent>('ai_skills_content_ja', 'json');
  return content;
});

/**
 * Load AI-generated profile summary from KV
 */
export const loadAIProfileSummary = createServerFn().handler(async (): Promise<AIProfileSummary | null> => {
  const profile = await env.CACHE.get<AIProfileSummary>('ai_profile_summary_ja', 'json');
  return profile;
});

/**
 * Load workflow state from KV (cached) or D1 (fresh)
 */
export const loadWorkflowState = createServerFn().handler(async ({ context: { db } }): Promise<WorkflowState> => {
  // Try KV cache first
  const cached = await env.CACHE.get<WorkflowState>('ai_skills_state', 'json');
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
});

/**
 * Load complete AI skills state (content + profile + workflow)
 */
export const loadAISkillsState = createServerFn().handler(async ({ context: { db } }): Promise<AISkillsState> => {
  const [content, profile, workflow] = await Promise.all([
    env.CACHE.get<AISkillsContent>('ai_skills_content_ja', 'json'),
    env.CACHE.get<AIProfileSummary>('ai_profile_summary_ja', 'json'),
    env.CACHE.get<WorkflowState>('ai_skills_state', 'json'),
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
});

/**
 * Manually trigger the skills analysis workflow
 * Protected - only works in development or with proper auth
 */
export const triggerSkillsAnalysis = createServerFn().handler(async ({ context: { db } }): Promise<{ success: boolean; message: string }> => {
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
    await env.SKILLS_WORKFLOW.create();

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
});
