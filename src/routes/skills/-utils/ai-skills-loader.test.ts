import type * as schema from '#db/schema';
import type { AIProfileSummary, AISkillsContent, WorkflowState } from '#workflows/-utils/ai-skills-types';
import type { drizzle } from 'drizzle-orm/d1';

import { env } from 'cloudflare:workers';
import { eq } from 'drizzle-orm';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { workflowState } from '#db/schema';

import {
  createDB,
  loadAIProfileSummaryHandler,
  loadAISkillsContentHandler,
  loadAISkillsStateHandler,
  loadWorkflowStateHandler,
  triggerSkillsAnalysisHandler,
} from './ai-skills-loader';

type DB = ReturnType<typeof drizzle<typeof schema>>;

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

describe('ai-skills-loader', () => {
  let db: DB;
  let mockWorkflowBinding: { create: () => Promise<unknown> };

  beforeAll(async () => {
    // Apply migration
    await env.SKILLS_DB.prepare(WORKFLOW_STATE_MIGRATION).run();
    db = createDB(env.SKILLS_DB);

    mockWorkflowBinding = { create: vi.fn<() => Promise<unknown>>().mockResolvedValue({}) };
  });

  afterAll(async () => {
    await env.SKILLS_DB.prepare('DROP TABLE IF EXISTS workflow_state').run();
  });

  beforeEach(async () => {
    // Clean up KV
    await env.CACHE.delete('ai_skills_content_ja');
    await env.CACHE.delete('ai_profile_summary_ja');
    await env.CACHE.delete('ai_skills_state');

    // Clean up DB
    await db.delete(workflowState);

    // Reset mocks
    vi.clearAllMocks();
  });

  describe('loadAISkillsContentHandler', () => {
    it('returns KV data when present', async () => {
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

      await env.CACHE.put('ai_skills_content_ja', JSON.stringify(mockContent));

      const result = await loadAISkillsContentHandler(env.CACHE);

      expect(result).toStrictEqual(mockContent);
    });

    it('returns null when KV is empty', async () => {
      const result = await loadAISkillsContentHandler(env.CACHE);

      expect(result).toBeNull();
    });

    it('returns null and deletes corrupted KV data', async () => {
      await env.CACHE.put('ai_skills_content_ja', 'undefined');

      const result = await loadAISkillsContentHandler(env.CACHE);

      expect(result).toBeNull();
      const stored = await env.CACHE.get('ai_skills_content_ja');
      expect(stored).toBeNull();
    });
  });

  describe('loadAIProfileSummaryHandler', () => {
    it('returns KV data when present', async () => {
      const mockProfile: AIProfileSummary = {
        summary_ja: 'テストサマリー',
        activity_narrative_ja: 'テスト活動',
        skill_comparison_ja: 'テスト比較',
        generated_at: '2024-01-01T00:00:00Z',
        model_used: 'claude-3-opus',
      };

      await env.CACHE.put('ai_profile_summary_ja', JSON.stringify(mockProfile));

      const result = await loadAIProfileSummaryHandler(env.CACHE);

      expect(result).toStrictEqual(mockProfile);
    });

    it('returns null when KV is empty', async () => {
      const result = await loadAIProfileSummaryHandler(env.CACHE);

      expect(result).toBeNull();
    });

    it('returns null and deletes corrupted KV data', async () => {
      await env.CACHE.put('ai_profile_summary_ja', 'undefined');

      const result = await loadAIProfileSummaryHandler(env.CACHE);

      expect(result).toBeNull();
      const stored = await env.CACHE.get('ai_profile_summary_ja');
      expect(stored).toBeNull();
    });
  });

  describe('loadWorkflowStateHandler', () => {
    it('returns cached KV state when present', async () => {
      const mockState: WorkflowState = {
        phase: 'fetching-commits',
        progress_pct: 50,
        current_repo: 'eve0415/test',
        repos_total: 10,
        repos_processed: 5,
        last_run_at: '2024-01-01T00:00:00Z',
        last_completed_at: null,
        error_message: null,
      };

      await env.CACHE.put('ai_skills_state', JSON.stringify(mockState));

      const result = await loadWorkflowStateHandler(env.CACHE, db);

      expect(result).toStrictEqual(mockState);
    });

    it('falls back to D1 when KV is empty', async () => {
      // Insert state into D1
      await db.insert(workflowState).values({
        id: 1,
        phase: 'completed',
        progressPct: 100,
        currentRepo: null,
        reposTotal: 20,
        reposProcessed: 20,
        lastRunAt: '2024-01-01T00:00:00Z',
        lastCompletedAt: '2024-01-01T01:00:00Z',
        errorMessage: null,
      });

      const result = await loadWorkflowStateHandler(env.CACHE, db);

      expect(result.phase).toBe('completed');
      expect(result.progress_pct).toBe(100);
      expect(result.repos_total).toBe(20);
      expect(result.repos_processed).toBe(20);
    });

    it('returns default idle state when both KV and D1 are empty', async () => {
      const result = await loadWorkflowStateHandler(env.CACHE, db);

      expect(result.phase).toBe('idle');
      expect(result.progress_pct).toBe(0);
      expect(result.repos_total).toBe(0);
      expect(result.repos_processed).toBe(0);
      expect(result.current_repo).toBeNull();
      expect(result.error_message).toBeNull();
    });

    it('self-heals corrupted KV by falling back to D1 and rewriting cache', async () => {
      await env.CACHE.put('ai_skills_state', 'undefined');
      await db.insert(workflowState).values({
        id: 1,
        phase: 'completed',
        progressPct: 100,
        currentRepo: null,
        reposTotal: 15,
        reposProcessed: 15,
        lastRunAt: '2024-01-01T00:00:00Z',
        lastCompletedAt: '2024-01-01T01:00:00Z',
        errorMessage: null,
      });

      const result = await loadWorkflowStateHandler(env.CACHE, db);

      expect(result.phase).toBe('completed');
      expect(result.repos_total).toBe(15);

      // Verify KV was rewritten with valid data
      const healed = await env.CACHE.get<WorkflowState>('ai_skills_state', 'json');
      expect(healed?.phase).toBe('completed');
      expect(healed?.repos_total).toBe(15);
    });

    it('returns default state when corrupted KV and no D1 data', async () => {
      await env.CACHE.put('ai_skills_state', 'undefined');

      const result = await loadWorkflowStateHandler(env.CACHE, db);

      expect(result.phase).toBe('idle');
      expect(result.progress_pct).toBe(0);
    });
  });

  describe('loadAISkillsStateHandler', () => {
    it('aggregates all sources', async () => {
      const mockContent: AISkillsContent = {
        skills: [],
        generated_at: '2024-01-01T00:00:00Z',
        model_used: 'claude-3-opus',
        total_commits_analyzed: 100,
        total_prs_analyzed: 50,
        total_reviews_analyzed: 25,
      };

      const mockProfile: AIProfileSummary = {
        summary_ja: 'テスト',
        activity_narrative_ja: 'テスト活動',
        skill_comparison_ja: 'テスト比較',
        generated_at: '2024-01-01T00:00:00Z',
        model_used: 'claude-3-opus',
      };

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

    it('returns null for missing content and profile', async () => {
      const result = await loadAISkillsStateHandler(env.CACHE, db);

      expect(result.content).toBeNull();
      expect(result.profile).toBeNull();
      expect(result.workflow.phase).toBe('idle');
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

    it('self-heals corrupted workflow KV from D1', async () => {
      await env.CACHE.put('ai_skills_state', 'undefined');
      await db.insert(workflowState).values({
        id: 1,
        phase: 'completed',
        progressPct: 100,
        currentRepo: null,
        reposTotal: 10,
        reposProcessed: 10,
        lastRunAt: '2024-01-01T00:00:00Z',
        lastCompletedAt: '2024-01-01T01:00:00Z',
        errorMessage: null,
      });

      const result = await loadAISkillsStateHandler(env.CACHE, db);

      expect(result.workflow.phase).toBe('completed');
      expect(result.workflow.repos_total).toBe(10);

      // Verify KV was rewritten
      const healed = await env.CACHE.get<WorkflowState>('ai_skills_state', 'json');
      expect(healed?.phase).toBe('completed');
    });
  });

  describe('triggerSkillsAnalysisHandler', () => {
    beforeEach(async () => {
      // Initialize workflow state
      await db.insert(workflowState).values({
        id: 1,
        phase: 'idle',
        progressPct: 0,
        reposTotal: 0,
        reposProcessed: 0,
      });
    });

    it('returns error if workflow is already running', async () => {
      await db.update(workflowState).set({ phase: 'fetching-commits' }).where(eq(workflowState.id, 1));

      const result = await triggerSkillsAnalysisHandler(db, mockWorkflowBinding);

      expect(result.success).toBeFalsy();
      expect(result.message).toContain('already running');
      expect(mockWorkflowBinding.create).not.toHaveBeenCalled();
    });

    it('allows triggering when phase is idle', async () => {
      const result = await triggerSkillsAnalysisHandler(db, mockWorkflowBinding);

      expect(result.success).toBeTruthy();
      expect(result.message).toBe('Workflow triggered successfully');
      expect(mockWorkflowBinding.create).toHaveBeenCalledOnce();
    });

    it('allows triggering when phase is completed', async () => {
      await db.update(workflowState).set({ phase: 'completed' }).where(eq(workflowState.id, 1));

      const result = await triggerSkillsAnalysisHandler(db, mockWorkflowBinding);

      expect(result.success).toBeTruthy();
      expect(mockWorkflowBinding.create).toHaveBeenCalledOnce();
    });

    it('allows triggering when phase is error', async () => {
      await db.update(workflowState).set({ phase: 'error', errorMessage: 'Previous error' }).where(eq(workflowState.id, 1));

      const result = await triggerSkillsAnalysisHandler(db, mockWorkflowBinding);

      expect(result.success).toBeTruthy();
      expect(mockWorkflowBinding.create).toHaveBeenCalledOnce();
    });

    it('updates state to listing-repos when triggering', async () => {
      await triggerSkillsAnalysisHandler(db, mockWorkflowBinding);

      const state = await db.select().from(workflowState).where(eq(workflowState.id, 1)).get();

      expect(state?.phase).toBe('listing-repos');
      expect(state?.lastRunAt).toBeDefined();
      expect(state?.errorMessage).toBeNull();
    });

    it('returns error message on workflow failure', async () => {
      const failingBinding = { create: vi.fn<() => Promise<unknown>>().mockRejectedValueOnce(new Error('Workflow service unavailable')) };

      const result = await triggerSkillsAnalysisHandler(db, failingBinding);

      expect(result.success).toBeFalsy();
      expect(result.message).toBe('Workflow service unavailable');
    });
  });
});
