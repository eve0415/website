import type { AIProfileSummary, AISkillsContent, WorkflowState } from '#workflows/-utils/ai-skills-types';

import { env } from 'cloudflare:test';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import * as schema from '#db/schema';
import { workflowState } from '#db/schema';

// Store original handlers extracted from createServerFn
let loadAISkillsContentHandler: () => Promise<AISkillsContent | null>;
let loadAIProfileSummaryHandler: () => Promise<AIProfileSummary | null>;
let loadWorkflowStateHandler: (args: { context: { db: ReturnType<typeof drizzle<typeof schema>> } }) => Promise<WorkflowState>;
let loadAISkillsStateHandler: (args: { context: { db: ReturnType<typeof drizzle<typeof schema>> } }) => Promise<{
  content: AISkillsContent | null;
  profile: AIProfileSummary | null;
  workflow: WorkflowState;
}>;
let triggerSkillsAnalysisHandler: (args: { context: { db: ReturnType<typeof drizzle<typeof schema>> } }) => Promise<{ success: boolean; message: string }>;

// Mock createServerFn to extract handlers
vi.mock('@tanstack/react-start', () => ({
  createServerFn: vi.fn(() => ({
    handler: vi.fn((fn: (...args: unknown[]) => unknown) => {
      // Return the handler wrapped in an object so tests can call it
      return fn;
    }),
  })),
}));

// Mock SKILLS_WORKFLOW
const mockWorkflowCreate = vi.fn().mockResolvedValue(undefined);
vi.mock('cloudflare:workers', async () => {
  const cloudflareTest = await import('cloudflare:test');
  return {
    env: {
      ...cloudflareTest.env,
      SKILLS_WORKFLOW: {
        create: mockWorkflowCreate,
      },
    },
  };
});

// Import after mocks are set up
const aiSkillsLoaderModule = await import('./ai-skills-loader');

// Extract handlers from the module
loadAISkillsContentHandler = aiSkillsLoaderModule.loadAISkillsContent as unknown as typeof loadAISkillsContentHandler;
loadAIProfileSummaryHandler = aiSkillsLoaderModule.loadAIProfileSummary as unknown as typeof loadAIProfileSummaryHandler;
loadWorkflowStateHandler = aiSkillsLoaderModule.loadWorkflowState as unknown as typeof loadWorkflowStateHandler;
loadAISkillsStateHandler = aiSkillsLoaderModule.loadAISkillsState as unknown as typeof loadAISkillsStateHandler;
triggerSkillsAnalysisHandler = aiSkillsLoaderModule.triggerSkillsAnalysis as unknown as typeof triggerSkillsAnalysisHandler;

// SQL migrations
const MIGRATIONS = [
  `CREATE TABLE IF NOT EXISTS workflow_state (
    id INTEGER PRIMARY KEY DEFAULT 1 NOT NULL,
    phase TEXT DEFAULT 'idle' NOT NULL,
    progress_pct INTEGER DEFAULT 0 NOT NULL,
    current_repo TEXT,
    repos_total INTEGER DEFAULT 0 NOT NULL,
    repos_processed INTEGER DEFAULT 0 NOT NULL,
    last_run_at TEXT,
    last_completed_at TEXT,
    error_message TEXT
  )`,
];

describe('ai-skills-loader', () => {
  let db: ReturnType<typeof drizzle<typeof schema>>;

  beforeAll(async () => {
    // Apply migrations
    const statements = MIGRATIONS.map(sql => env.SKILLS_DB.prepare(sql));
    await env.SKILLS_DB.batch(statements);
    db = drizzle(env.SKILLS_DB, { schema, casing: 'snake_case' });
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

  describe('loadAISkillsContent', () => {
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

      const result = await loadAISkillsContentHandler();

      expect(result).toEqual(mockContent);
    });

    it('returns null when KV is empty', async () => {
      const result = await loadAISkillsContentHandler();

      expect(result).toBeNull();
    });
  });

  describe('loadAIProfileSummary', () => {
    it('returns KV data when present', async () => {
      const mockProfile: AIProfileSummary = {
        summary_ja: 'テストサマリー',
        activity_narrative_ja: 'テスト活動',
        skill_comparison_ja: 'テスト比較',
        generated_at: '2024-01-01T00:00:00Z',
        model_used: 'claude-3-opus',
      };

      await env.CACHE.put('ai_profile_summary_ja', JSON.stringify(mockProfile));

      const result = await loadAIProfileSummaryHandler();

      expect(result).toEqual(mockProfile);
    });

    it('returns null when KV is empty', async () => {
      const result = await loadAIProfileSummaryHandler();

      expect(result).toBeNull();
    });
  });

  describe('loadWorkflowState', () => {
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

      const result = await loadWorkflowStateHandler({ context: { db } });

      expect(result).toEqual(mockState);
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

      const result = await loadWorkflowStateHandler({ context: { db } });

      expect(result.phase).toBe('completed');
      expect(result.progress_pct).toBe(100);
      expect(result.repos_total).toBe(20);
      expect(result.repos_processed).toBe(20);
    });

    it('returns default idle state when both KV and D1 are empty', async () => {
      const result = await loadWorkflowStateHandler({ context: { db } });

      expect(result.phase).toBe('idle');
      expect(result.progress_pct).toBe(0);
      expect(result.repos_total).toBe(0);
      expect(result.repos_processed).toBe(0);
      expect(result.current_repo).toBeNull();
      expect(result.error_message).toBeNull();
    });
  });

  describe('loadAISkillsState', () => {
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

      const result = await loadAISkillsStateHandler({ context: { db } });

      expect(result.content).toEqual(mockContent);
      expect(result.profile).toEqual(mockProfile);
      expect(result.workflow).toEqual(mockWorkflow);
    });

    it('returns null for missing content and profile', async () => {
      const result = await loadAISkillsStateHandler({ context: { db } });

      expect(result.content).toBeNull();
      expect(result.profile).toBeNull();
      expect(result.workflow.phase).toBe('idle');
    });
  });

  describe('triggerSkillsAnalysis', () => {
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

      const result = await triggerSkillsAnalysisHandler({ context: { db } });

      expect(result.success).toBe(false);
      expect(result.message).toContain('already running');
      expect(mockWorkflowCreate).not.toHaveBeenCalled();
    });

    it('allows triggering when phase is idle', async () => {
      const result = await triggerSkillsAnalysisHandler({ context: { db } });

      expect(result.success).toBe(true);
      expect(result.message).toBe('Workflow triggered successfully');
      expect(mockWorkflowCreate).toHaveBeenCalledTimes(1);
    });

    it('allows triggering when phase is completed', async () => {
      await db.update(workflowState).set({ phase: 'completed' }).where(eq(workflowState.id, 1));

      const result = await triggerSkillsAnalysisHandler({ context: { db } });

      expect(result.success).toBe(true);
      expect(mockWorkflowCreate).toHaveBeenCalledTimes(1);
    });

    it('allows triggering when phase is error', async () => {
      await db.update(workflowState).set({ phase: 'error', errorMessage: 'Previous error' }).where(eq(workflowState.id, 1));

      const result = await triggerSkillsAnalysisHandler({ context: { db } });

      expect(result.success).toBe(true);
      expect(mockWorkflowCreate).toHaveBeenCalledTimes(1);
    });

    it('updates state to listing-repos when triggering', async () => {
      await triggerSkillsAnalysisHandler({ context: { db } });

      const state = await db.select().from(workflowState).where(eq(workflowState.id, 1)).get();

      expect(state?.phase).toBe('listing-repos');
      expect(state?.lastRunAt).toBeDefined();
      expect(state?.errorMessage).toBeNull();
    });

    it('returns error message on workflow failure', async () => {
      mockWorkflowCreate.mockRejectedValueOnce(new Error('Workflow service unavailable'));

      const result = await triggerSkillsAnalysisHandler({ context: { db } });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Workflow service unavailable');
    });
  });
});
