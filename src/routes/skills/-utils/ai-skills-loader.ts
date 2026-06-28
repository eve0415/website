// Server function to load AI skills data from KV

import type { AIProfileSummary, AISkillsContent, AISkillsState, WorkflowState } from '#workflows/-utils/ai-skills-types';
import type { DrizzleD1Database } from 'drizzle-orm/d1';

import { createServerFn } from '@tanstack/react-start';
import { env } from 'cloudflare:workers';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';

import * as schema from '#db/schema';
import { workflowState } from '#db/schema';
import { DEFAULT_WORKFLOW_STATE, WORKFLOW_STATE_KV_KEY, WORKFLOW_STATE_KV_TTL_SECONDS, mapWorkflowStateRow } from '#workflows/-utils/workflow-state';

type DB = DrizzleD1Database;

// Helper to safely parse JSON from KV, handling corrupted data
const safeKVGetJSON = async <T>(kv: KVNamespace, key: string): Promise<T | null> => {
  try {
    return await kv.get<T>(key, 'json');
  } catch {
    await kv.delete(key);
    return null;
  }
};

/**
 * Handler: Load complete AI skills state (content + profile + workflow)
 * @internal Exported for testing
 */
export const loadAISkillsStateHandler = async (kv: KVNamespace, db: DB): Promise<AISkillsState> => {
  const [content, profile, cachedWorkflow] = await Promise.all([
    safeKVGetJSON<AISkillsContent>(kv, 'ai_skills_content_ja'),
    safeKVGetJSON<AIProfileSummary>(kv, 'ai_profile_summary_ja'),
    safeKVGetJSON<WorkflowState>(kv, WORKFLOW_STATE_KV_KEY),
  ]);

  let workflow = cachedWorkflow;
  if (!workflow) {
    const row = await db.select().from(workflowState).where(eq(workflowState.id, 1)).get();
    workflow = row ? mapWorkflowStateRow(row) : DEFAULT_WORKFLOW_STATE;

    // Repopulate the cache on every miss, not just on corruption
    await kv.put(WORKFLOW_STATE_KV_KEY, JSON.stringify(workflow), {
      expirationTtl: WORKFLOW_STATE_KV_TTL_SECONDS,
    });
  }

  return { content, profile, workflow };
};

// Helper to create DB instance from D1 binding
export const createDB = (d1: D1Database): DB => drizzle(d1, { schema });

/**
 * Load complete AI skills state (content + profile + workflow)
 */
export const loadAISkillsState = createServerFn().handler(async ({ context: { db } }): Promise<AISkillsState> => loadAISkillsStateHandler(env.CACHE, db));
