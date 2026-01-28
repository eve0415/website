/* oxlint-disable typescript-eslint(no-non-null-assertion) -- Test assertions verify existence */
// Unit tests for Skills Analysis Workflow utilities
// Note: Full workflow testing requires Cloudflare Workflows runtime.
// These tests validate utility functions and database operations.

import { env } from 'cloudflare:workers';
import { count, desc, eq, sql, sum } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import * as schema from '#db/schema';
import { commits, repos, workflowState } from '#db/schema';

import { classifyRepo, sanitizeForAI } from './-utils/privacy-filter';

// SQL migrations - must be applied before tests
const MIGRATIONS = [
  `CREATE TABLE IF NOT EXISTS repos (
    id INTEGER PRIMARY KEY NOT NULL,
    github_id INTEGER NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    name TEXT NOT NULL,
    owner TEXT NOT NULL,
    is_private INTEGER DEFAULT 0 NOT NULL,
    is_fork INTEGER DEFAULT 0 NOT NULL,
    privacy_class TEXT NOT NULL,
    default_branch TEXT,
    language TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    fetched_at TEXT DEFAULT (datetime('now')) NOT NULL,
    last_commit_at TEXT,
    last_pr_updated_at TEXT,
    commits_cursor TEXT,
    prs_cursor TEXT
  )`,
  `CREATE INDEX IF NOT EXISTS idx_repos_privacy ON repos (privacy_class)`,
  `CREATE INDEX IF NOT EXISTS idx_repos_language ON repos (language)`,
  `CREATE TABLE IF NOT EXISTS commits (
    id INTEGER PRIMARY KEY NOT NULL,
    sha TEXT NOT NULL UNIQUE,
    repo_id INTEGER NOT NULL REFERENCES repos(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    author_date TEXT NOT NULL,
    additions INTEGER DEFAULT 0 NOT NULL,
    deletions INTEGER DEFAULT 0 NOT NULL,
    files_changed INTEGER DEFAULT 0 NOT NULL,
    languages TEXT,
    fetched_at TEXT DEFAULT (datetime('now')) NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_commits_repo ON commits (repo_id)`,
  `CREATE INDEX IF NOT EXISTS idx_commits_date ON commits (author_date)`,
  `CREATE TABLE IF NOT EXISTS pull_requests (
    id INTEGER PRIMARY KEY NOT NULL,
    github_id INTEGER NOT NULL UNIQUE,
    repo_id INTEGER NOT NULL REFERENCES repos(id) ON DELETE CASCADE,
    number INTEGER NOT NULL,
    title TEXT NOT NULL,
    body TEXT,
    state TEXT NOT NULL,
    merged INTEGER DEFAULT 0 NOT NULL,
    additions INTEGER DEFAULT 0 NOT NULL,
    deletions INTEGER DEFAULT 0 NOT NULL,
    changed_files INTEGER DEFAULT 0 NOT NULL,
    commits_count INTEGER DEFAULT 0 NOT NULL,
    comments_count INTEGER DEFAULT 0 NOT NULL,
    review_comments_count INTEGER DEFAULT 0 NOT NULL,
    created_at TEXT NOT NULL,
    merged_at TEXT,
    closed_at TEXT,
    fetched_at TEXT DEFAULT (datetime('now')) NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_prs_repo ON pull_requests (repo_id)`,
  `CREATE INDEX IF NOT EXISTS idx_prs_state ON pull_requests (state)`,
  `CREATE INDEX IF NOT EXISTS idx_prs_created ON pull_requests (created_at)`,
  `CREATE TABLE IF NOT EXISTS pr_reviews (
    id INTEGER PRIMARY KEY NOT NULL,
    github_id INTEGER NOT NULL UNIQUE,
    repo_id INTEGER NOT NULL REFERENCES repos(id) ON DELETE CASCADE,
    pr_number INTEGER NOT NULL,
    pr_title TEXT,
    state TEXT NOT NULL,
    body TEXT,
    submitted_at TEXT NOT NULL,
    fetched_at TEXT DEFAULT (datetime('now')) NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_reviews_repo ON pr_reviews (repo_id)`,
  `CREATE INDEX IF NOT EXISTS idx_reviews_submitted ON pr_reviews (submitted_at)`,
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
  `CREATE TABLE IF NOT EXISTS history_summaries (
    id INTEGER PRIMARY KEY NOT NULL,
    summary_type TEXT NOT NULL,
    time_range TEXT NOT NULL,
    content TEXT NOT NULL,
    token_estimate INTEGER DEFAULT 0 NOT NULL,
    created_at TEXT DEFAULT (datetime('now')) NOT NULL
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_summaries_type_range ON history_summaries (summary_type, time_range)`,
];

beforeAll(async () => {
  // Apply migrations using D1's batch API
  const statements = MIGRATIONS.map(sql => env.SKILLS_DB.prepare(sql));
  await env.SKILLS_DB.batch(statements);
});

afterAll(async () => {
  // Clean up tables
  await env.SKILLS_DB.prepare('DROP TABLE IF EXISTS history_summaries').run();
  await env.SKILLS_DB.prepare('DROP TABLE IF EXISTS pr_reviews').run();
  await env.SKILLS_DB.prepare('DROP TABLE IF EXISTS pull_requests').run();
  await env.SKILLS_DB.prepare('DROP TABLE IF EXISTS commits').run();
  await env.SKILLS_DB.prepare('DROP TABLE IF EXISTS repos').run();
  await env.SKILLS_DB.prepare('DROP TABLE IF EXISTS workflow_state').run();
});

describe('privacy filter utilities', () => {
  describe('classifyRepo', () => {
    it('classifies private repos as private', () => {
      const repo = {
        id: 1,
        full_name: 'eve0415/private-repo',
        name: 'private-repo',
        owner: { login: 'eve0415' },
        private: true,
        fork: false,
        default_branch: 'main',
        language: 'TypeScript',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      expect(classifyRepo(repo)).toBe('private');
    });

    it('classifies own public repos as self', () => {
      const repo = {
        id: 1,
        full_name: 'eve0415/public-repo',
        name: 'public-repo',
        owner: { login: 'eve0415' },
        private: false,
        fork: false,
        default_branch: 'main',
        language: 'TypeScript',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      expect(classifyRepo(repo)).toBe('self');
    });

    it('classifies hidden org repos as member-org', () => {
      const repo = {
        id: 1,
        full_name: 'DigitaltalPlayground/project',
        name: 'project',
        owner: { login: 'DigitaltalPlayground' },
        private: false,
        fork: false,
        default_branch: 'main',
        language: 'TypeScript',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      expect(classifyRepo(repo)).toBe('member-org');
    });

    it('classifies external OSS as external', () => {
      const repo = {
        id: 1,
        full_name: 'facebook/react',
        name: 'react',
        owner: { login: 'facebook' },
        private: false,
        fork: false,
        default_branch: 'main',
        language: 'JavaScript',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      expect(classifyRepo(repo)).toBe('external');
    });
  });

  describe('sanitizeForAI', () => {
    it('removes private repo names from text', () => {
      const text = 'Working on secret-corp/internal-app and added new features';
      const privateRepos = ['secret-corp/internal-app'];

      const result = sanitizeForAI(text, privateRepos);

      expect(result).not.toContain('secret-corp/internal-app');
      expect(result).toContain('[private-repo]');
    });

    it('removes standalone repo names', () => {
      const text = 'The internal-app has a bug';
      const privateRepos = ['company/internal-app'];

      const result = sanitizeForAI(text, privateRepos);

      expect(result).not.toContain('internal-app');
      expect(result).toContain('[private]');
    });

    it('handles case-insensitive matches', () => {
      const text = 'Fixed bug in INTERNAL-APP';
      const privateRepos = ['company/internal-app'];

      const result = sanitizeForAI(text, privateRepos);

      expect(result).not.toContain('INTERNAL-APP');
    });
  });
});

describe('database operations', () => {
  let db: ReturnType<typeof drizzle<typeof schema>>;

  beforeEach(async () => {
    db = drizzle(env.SKILLS_DB, { schema, casing: 'snake_case' });

    // Clean up before each test
    await db.delete(repos);
  });

  describe('repos table', () => {
    it('inserts and retrieves repos', async () => {
      await db.insert(repos).values({
        githubId: 12345,
        fullName: 'eve0415/test-repo',
        name: 'test-repo',
        owner: 'eve0415',
        isPrivate: false,
        isFork: false,
        privacyClass: 'self',
        defaultBranch: 'main',
        language: 'TypeScript',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      });

      const result = await db.select().from(repos).where(eq(repos.githubId, 12345)).get();

      expect(result).toBeDefined();
      expect(result?.name).toBe('test-repo');
      expect(result?.privacyClass).toBe('self');
    });

    it('updates repos with incremental sync columns', async () => {
      await db.insert(repos).values({
        githubId: 12345,
        fullName: 'eve0415/test-repo',
        name: 'test-repo',
        owner: 'eve0415',
        isPrivate: false,
        isFork: false,
        privacyClass: 'self',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      });

      await db
        .update(repos)
        .set({
          lastCommitAt: '2024-01-15T10:00:00Z',
          lastPrUpdatedAt: '2024-01-14T10:00:00Z',
          commitsCursor: 'cursor123',
          prsCursor: 'cursor456',
        })
        .where(eq(repos.githubId, 12345));

      const result = await db.select().from(repos).where(eq(repos.githubId, 12345)).get();

      expect(result?.lastCommitAt).toBe('2024-01-15T10:00:00Z');
      expect(result?.lastPrUpdatedAt).toBe('2024-01-14T10:00:00Z');
      expect(result?.commitsCursor).toBe('cursor123');
      expect(result?.prsCursor).toBe('cursor456');
    });

    it('handles upsert on conflict', async () => {
      // Insert initial
      await db.insert(repos).values({
        githubId: 12345,
        fullName: 'eve0415/test-repo',
        name: 'test-repo',
        owner: 'eve0415',
        isPrivate: false,
        isFork: false,
        privacyClass: 'self',
        language: 'JavaScript',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      });

      // Upsert with new data
      await db
        .insert(repos)
        .values({
          githubId: 12345,
          fullName: 'eve0415/test-repo',
          name: 'test-repo',
          owner: 'eve0415',
          isPrivate: false,
          isFork: false,
          privacyClass: 'self',
          language: 'TypeScript', // Changed
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2024-01-15T00:00:00Z', // Changed
        })
        .onConflictDoUpdate({
          target: repos.githubId,
          set: {
            language: 'TypeScript',
            updatedAt: '2024-01-15T00:00:00Z',
          },
        });

      const result = await db.select().from(repos).where(eq(repos.githubId, 12345)).get();

      expect(result?.language).toBe('TypeScript');
      expect(result?.updatedAt).toBe('2024-01-15T00:00:00Z');
    });
  });

  describe('workflow_state table', () => {
    beforeEach(async () => {
      // Clean and initialize workflow state
      await db.delete(workflowState);
      await db.insert(workflowState).values({
        id: 1,
        phase: 'idle',
        progressPct: 0,
        reposTotal: 0,
        reposProcessed: 0,
      });
    });

    it('updates workflow phase', async () => {
      await db
        .update(workflowState)
        .set({
          phase: 'fetching-commits',
          progressPct: 25,
          currentRepo: 'eve0415/test-repo',
        })
        .where(eq(workflowState.id, 1));

      const result = await db.select().from(workflowState).where(eq(workflowState.id, 1)).get();

      expect(result?.phase).toBe('fetching-commits');
      expect(result?.progressPct).toBe(25);
      expect(result?.currentRepo).toBe('eve0415/test-repo');
    });

    it('tracks completion state', async () => {
      await db
        .update(workflowState)
        .set({
          phase: 'completed',
          progressPct: 100,
          reposTotal: 50,
          reposProcessed: 50,
          lastCompletedAt: '2024-01-15T12:00:00Z',
        })
        .where(eq(workflowState.id, 1));

      const result = await db.select().from(workflowState).where(eq(workflowState.id, 1)).get();

      expect(result?.phase).toBe('completed');
      expect(result?.reposTotal).toBe(50);
      expect(result?.reposProcessed).toBe(50);
    });

    it('stores error state', async () => {
      await db
        .update(workflowState)
        .set({
          phase: 'error',
          errorMessage: 'Rate limit exceeded',
        })
        .where(eq(workflowState.id, 1));

      const result = await db.select().from(workflowState).where(eq(workflowState.id, 1)).get();

      expect(result?.phase).toBe('error');
      expect(result?.errorMessage).toBe('Rate limit exceeded');
    });
  });
});

describe('kV operations', () => {
  beforeEach(async () => {
    // Clean KV before each test
    await env.CACHE.delete('skills_workflow_lock');
    await env.CACHE.delete('skills_rate_limit_metrics');
  });

  describe('workflow lock', () => {
    it('stores and retrieves lock', async () => {
      const lock = {
        instanceId: 'test-instance-123',
        startedAt: '2024-01-15T10:00:00Z',
      };

      await env.CACHE.put('skills_workflow_lock', JSON.stringify(lock));

      const retrieved = await env.CACHE.get<{ instanceId: string; startedAt: string }>('skills_workflow_lock', 'json');

      expect(retrieved?.instanceId).toBe('test-instance-123');
    });

    it('returns null when no lock exists', async () => {
      const lock = await env.CACHE.get('skills_workflow_lock', 'json');
      expect(lock).toBeNull();
    });
  });

  describe('rate limit metrics', () => {
    it('stores and retrieves metrics', async () => {
      const metrics = {
        avgRequestsPerRepo: 15,
        lastRunRepoCount: 50,
        lastRunRequestCount: 750,
        updatedAt: '2024-01-15T12:00:00Z',
      };

      await env.CACHE.put('skills_rate_limit_metrics', JSON.stringify(metrics));

      const retrieved = await env.CACHE.get<typeof metrics>('skills_rate_limit_metrics', 'json');

      expect(retrieved?.avgRequestsPerRepo).toBe(15);
      expect(retrieved?.lastRunRepoCount).toBe(50);
    });
  });
});

describe('squashHistory query patterns', () => {
  let db: ReturnType<typeof drizzle<typeof schema>>;

  beforeEach(async () => {
    db = drizzle(env.SKILLS_DB, { schema, casing: 'snake_case' });
    await db.delete(commits);
    await db.delete(repos);
  });

  it('orders languages by lines changed descending', async () => {
    // Seed repos with different languages
    await db.insert(repos).values([
      {
        githubId: 1,
        fullName: 'test/ts-repo',
        name: 'ts-repo',
        owner: 'test',
        isPrivate: false,
        isFork: false,
        privacyClass: 'self',
        language: 'TypeScript',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        githubId: 2,
        fullName: 'test/go-repo',
        name: 'go-repo',
        owner: 'test',
        isPrivate: false,
        isFork: false,
        privacyClass: 'self',
        language: 'Go',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        githubId: 3,
        fullName: 'test/py-repo',
        name: 'py-repo',
        owner: 'test',
        isPrivate: false,
        isFork: false,
        privacyClass: 'self',
        language: 'Python',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ]);

    const repoRecords = await db.select().from(repos).all();
    const tsRepo = repoRecords.find(r => r.language === 'TypeScript')!;
    const goRepo = repoRecords.find(r => r.language === 'Go')!;
    const pyRepo = repoRecords.find(r => r.language === 'Python')!;

    // Seed commits: TS=1000 lines, Go=5000 lines, Python=100 lines
    await db.insert(commits).values([
      { sha: 'ts1', repoId: tsRepo.id, message: 'ts commit', authorDate: '2024-01-01T00:00:00Z', additions: 500, deletions: 500, filesChanged: 10 },
      { sha: 'go1', repoId: goRepo.id, message: 'go commit 1', authorDate: '2024-01-01T00:00:00Z', additions: 3000, deletions: 1000, filesChanged: 20 },
      { sha: 'go2', repoId: goRepo.id, message: 'go commit 2', authorDate: '2024-01-02T00:00:00Z', additions: 500, deletions: 500, filesChanged: 5 },
      { sha: 'py1', repoId: pyRepo.id, message: 'py commit', authorDate: '2024-01-01T00:00:00Z', additions: 50, deletions: 50, filesChanged: 2 },
    ]);

    // Run the query pattern from squashHistory
    const linesChanged = sum(sql`${commits.additions} + ${commits.deletions}`);
    const languages = await db
      .select({
        language: repos.language,
        commit_count: count(commits.id),
        lines_changed: linesChanged,
      })
      .from(commits)
      .innerJoin(repos, eq(commits.repoId, repos.id))
      .where(sql`${repos.language} IS NOT NULL`)
      .groupBy(repos.language)
      .orderBy(desc(linesChanged))
      .limit(20)
      .all();

    // Verify order: Go (5000) > TypeScript (1000) > Python (100)
    expect(languages).toHaveLength(3);
    expect(languages[0]?.language).toBe('Go');
    expect(languages[1]?.language).toBe('TypeScript');
    expect(languages[2]?.language).toBe('Python');
  });

  it('orders recent activity by commit count descending', async () => {
    // Seed repos
    await db.insert(repos).values([
      {
        githubId: 10,
        fullName: 'test/active-repo',
        name: 'active-repo',
        owner: 'test',
        isPrivate: false,
        isFork: false,
        privacyClass: 'self',
        language: 'Rust',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        githubId: 11,
        fullName: 'test/less-active-repo',
        name: 'less-active-repo',
        owner: 'test',
        isPrivate: false,
        isFork: false,
        privacyClass: 'self',
        language: 'Java',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ]);

    const repoRecords = await db.select().from(repos).all();
    const rustRepo = repoRecords.find(r => r.language === 'Rust')!;
    const javaRepo = repoRecords.find(r => r.language === 'Java')!;

    // Recent date within last 6 months
    const recentDate = new Date();
    recentDate.setMonth(recentDate.getMonth() - 1);
    const recentIso = recentDate.toISOString();

    // Rust: 5 recent commits, Java: 2 recent commits
    await db.insert(commits).values([
      { sha: 'rust1', repoId: rustRepo.id, message: 'rust 1', authorDate: recentIso, additions: 10, deletions: 5, filesChanged: 1 },
      { sha: 'rust2', repoId: rustRepo.id, message: 'rust 2', authorDate: recentIso, additions: 10, deletions: 5, filesChanged: 1 },
      { sha: 'rust3', repoId: rustRepo.id, message: 'rust 3', authorDate: recentIso, additions: 10, deletions: 5, filesChanged: 1 },
      { sha: 'rust4', repoId: rustRepo.id, message: 'rust 4', authorDate: recentIso, additions: 10, deletions: 5, filesChanged: 1 },
      { sha: 'rust5', repoId: rustRepo.id, message: 'rust 5', authorDate: recentIso, additions: 10, deletions: 5, filesChanged: 1 },
      { sha: 'java1', repoId: javaRepo.id, message: 'java 1', authorDate: recentIso, additions: 10, deletions: 5, filesChanged: 1 },
      { sha: 'java2', repoId: javaRepo.id, message: 'java 2', authorDate: recentIso, additions: 10, deletions: 5, filesChanged: 1 },
    ]);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentCommitCount = count(commits.id);
    const recentActivity = await db
      .select({
        language: repos.language,
        commits: recentCommitCount,
        privacy_class: repos.privacyClass,
      })
      .from(commits)
      .innerJoin(repos, eq(commits.repoId, repos.id))
      .where(sql`${commits.authorDate} > ${sixMonthsAgo.toISOString()}`)
      .groupBy(repos.language, repos.privacyClass)
      .orderBy(desc(recentCommitCount))
      .all();

    // Verify order: Rust (5) > Java (2)
    expect(recentActivity).toHaveLength(2);
    expect(recentActivity[0]?.language).toBe('Rust');
    expect(recentActivity[0]?.commits).toBe(5);
    expect(recentActivity[1]?.language).toBe('Java');
    expect(recentActivity[1]?.commits).toBe(2);
  });
});
