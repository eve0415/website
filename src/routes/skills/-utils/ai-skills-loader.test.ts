import type { AIProfileSummary, AISkillsContent, WorkflowState } from '#workflows/-utils/ai-skills-types';
import type { DrizzleD1Database } from 'drizzle-orm/d1';

import { env } from 'cloudflare:workers';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { workflowState } from '#db/schema';

import { createDB, loadAISkillsStateHandler } from './ai-skills-loader';

type DB = DrizzleD1Database;

// SQL migration for workflow_state table
const WORKFLOW_STATE_MIGRATION = `CREATE TABLE IF NOT EXISTS workflow_state (
  id INTEGER PRIMARY KEY DEFAULT 1 NOT NULL,
  phase TEXT DEFAULT 'idle' NOT NULL,
  progress_pct INTEGER DEFAULT 0 NOT NULL,
  current_repo TEXT,
  repos_total INTEGER DEFAULT 0 NOT NULL,
  repos_processed INTEGER DEFAULT 0 NOT NULL,
  last_run_at TEXT,
  last_completed_at TEXT,
  error_message TEXT
)`;

const mockContent: AISkillsContent = {
  skills: [
    {
      name: 'TypeScript',
      category: 'language',
      level: 'expert',
      confidence: 0.95,
      description_ja: 'テスト説明',
      evidence: ['test'],
      last_active: '2024-01-01T00:00:00Z',
      trend: 'rising',
      is_ai_discovered: false,
    },
  ],
  generated_at: '2024-01-01T00:00:00Z',
  model_used: 'claude-3-opus',
  total_commits_analyzed: 100,
  total_prs_analyzed: 50,
  total_reviews_analyzed: 25,
};

const mockProfile: AIProfileSummary = {
  summary_ja: 'テストサマリー',
  activity_narrative_ja: 'テスト活動',
  skill_comparison_ja: 'テスト比較',
  generated_at: '2024-01-01T00:00:00Z',
  model_used: 'claude-3-opus',
};

describe('ai-skills-loader', () => {
  let db: DB;

  beforeAll(async () => {
    // Apply migration
    await env.SKILLS_DB.prepare(WORKFLOW_STATE_MIGRATION).run();
    db = createDB(env.SKILLS_DB);
  });

  beforeEach(async () => {
    // Clean up KV
    await env.CACHE.delete('ai_skills_content_ja');
    await env.CACHE.delete('ai_profile_summary_ja');
    await env.CACHE.delete('ai_skills_state');

    // Clean up DB
    await db.delete(workflowState);
  });

  afterAll(async () => {
    await env.SKILLS_DB.prepare('DROP TABLE IF EXISTS workflow_state').run();
  });

  describe('loadAISkillsStateHandler', () => {
    it('aggregates all sources', async () => {
      const mockWorkflow: WorkflowState = {
        phase: 'completed',
        progress_pct: 100,
        current_repo: null,
        repos_total: 10,
        repos_processed: 10,
        last_run_at: '2024-01-01T00:00:00Z',
        last_completed_at: '2024-01-01T01:00:00Z',
        error_message: null,
      };

      await env.CACHE.put('ai_skills_content_ja', JSON.stringify(mockContent));
      await env.CACHE.put('ai_profile_summary_ja', JSON.stringify(mockProfile));
      await env.CACHE.put('ai_skills_state', JSON.stringify(mockWorkflow));

      const result = await loadAISkillsStateHandler(env.CACHE, db);

      expect(result.content).toStrictEqual(mockContent);
      expect(result.profile).toStrictEqual(mockProfile);
      expect(result.workflow).toStrictEqual(mockWorkflow);
    });

    it('returns null for missing content and profile, default idle workflow', async () => {
      const result = await loadAISkillsStateHandler(env.CACHE, db);

      expect(result.content).toBeNull();
      expect(result.profile).toBeNull();
      expect(result.workflow.phase).toBe('idle');
      expect(result.workflow.progress_pct).toBe(0);
      expect(result.workflow.current_repo).toBeNull();
      expect(result.workflow.error_message).toBeNull();
    });

    it('handles corrupted content and profile gracefully', async () => {
      await env.CACHE.put('ai_skills_content_ja', 'undefined');
      await env.CACHE.put('ai_profile_summary_ja', '{invalid json');

      const result = await loadAISkillsStateHandler(env.CACHE, db);

      expect(result.content).toBeNull();
      expect(result.profile).toBeNull();
      expect(result.workflow.phase).toBe('idle');

      // Verify corrupted keys were deleted
      await expect(env.CACHE.get('ai_skills_content_ja')).resolves.toBeNull();
      await expect(env.CACHE.get('ai_profile_summary_ja')).resolves.toBeNull();
    });

    it('falls back to D1 mapping camelCase to the wire shape', async () => {
      await db.insert(workflowState).values({
        id: 1,
        phase: 'fetching-commits',
        progressPct: 42,
        currentRepo: 'eve0415/website',
        reposTotal: 20,
        reposProcessed: 8,
        lastRunAt: '2024-01-01T00:00:00Z',
        lastCompletedAt: null,
        errorMessage: null,
      });

      const result = await loadAISkillsStateHandler(env.CACHE, db);

      expect(result.workflow).toStrictEqual({
        phase: 'fetching-commits',
        progress_pct: 42,
        current_repo: 'eve0415/website',
        repos_total: 20,
        repos_processed: 8,
        last_run_at: '2024-01-01T00:00:00Z',
        last_completed_at: null,
        error_message: null,
      });
    });

    it('repopulates the KV cache on a plain miss, not just on corruption', async () => {
      await db.insert(workflowState).values({
        id: 1,
        phase: 'completed',
        progressPct: 100,
        reposTotal: 20,
        reposProcessed: 20,
        lastCompletedAt: '2024-01-01T01:00:00Z',
      });

      await loadAISkillsStateHandler(env.CACHE, db);

      const cached = await env.CACHE.get<WorkflowState>('ai_skills_state', 'json');
      expect(cached?.phase).toBe('completed');
      expect(cached?.repos_total).toBe(20);
    });

    it('self-heals corrupted workflow KV from D1', async () => {
      await env.CACHE.put('ai_skills_state', 'undefined');
      await db.insert(workflowState).values({
        id: 1,
        phase: 'completed',
        progressPct: 100,
        reposTotal: 10,
        reposProcessed: 10,
        lastRunAt: '2024-01-01T00:00:00Z',
        lastCompletedAt: '2024-01-01T01:00:00Z',
      });

      const result = await loadAISkillsStateHandler(env.CACHE, db);

      expect(result.workflow.phase).toBe('completed');
      expect(result.workflow.repos_total).toBe(10);

      // Verify KV was rewritten
      const healed = await env.CACHE.get<WorkflowState>('ai_skills_state', 'json');
      expect(healed?.phase).toBe('completed');
    });

    it('maps an unknown phase from D1 to idle', async () => {
      await db.insert(workflowState).values({
        id: 1,
        phase: 'something-new',
        progressPct: 10,
        reposTotal: 0,
        reposProcessed: 0,
      });

      const result = await loadAISkillsStateHandler(env.CACHE, db);

      expect(result.workflow.phase).toBe('idle');
    });
  });
});
