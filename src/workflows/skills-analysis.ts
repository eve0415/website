/* oxlint-disable typescript/no-non-null-assertion, no-await-in-loop -- GitHub GraphQL non-null fields lack type-level guarantees; workflow pagination requires sequential await */
// Cloudflare Workflow for AI Skills Analysis
// Uses GitHub GraphQL API with sleepUntil for rate limits
// Supports incremental syncing and singleton execution

import type { Repo } from '#db/types';
import type { AIProfileSummary, AISkill, AISkillsContent, WorkflowPhase } from './-utils/ai-skills-types';
import type { GraphQLRateLimit, RateLimitMetrics } from './-utils/github-graphql';
import type { WorkflowEvent, WorkflowStep } from 'cloudflare:workers';
import type { DrizzleD1Database } from 'drizzle-orm/d1';

import { WorkflowEntrypoint } from 'cloudflare:workers';
import { count, desc, eq, inArray, sql, sum } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';

import * as schema from '#db/schema';
import { commits, historySummaries, prReviews, pullRequests, repos, workflowState } from '#db/schema';

import { isAIProfileDraft, isAISkillDraft } from './-utils/ai-skills-types';
import {
  DEFAULT_RATE_LIMIT_METRICS,
  GITHUB_USERNAME,
  calculateDynamicThreshold,
  createGitHubClient,
  fetchRepoCommits,
  fetchRepoPRs,
  fetchUserRepos,
  isPRAuthoredByUser,
} from './-utils/github-graphql';
import { classifyRepo, getRepoDisplayName, sanitizeForAI } from './-utils/privacy-filter';
import { WORKFLOW_STATE_KV_KEY, WORKFLOW_STATE_KV_TTL_SECONDS, mapWorkflowStateRow } from './-utils/workflow-state';

// KV keys
const WORKFLOW_LOCK_KEY = 'skills_workflow_lock';
const RATE_LIMIT_METRICS_KEY = 'skills_rate_limit_metrics';

// Type alias for drizzle database
type DB = DrizzleD1Database<typeof schema>;

interface WorkflowEnv {
  GITHUB_PAT: string;
  SKILLS_DB: D1Database;
  CACHE: KVNamespace;
  AI: Ai;
  SKILLS_WORKFLOW: Workflow;
}

interface WorkflowLock {
  instanceId: string;
  startedAt: string;
}

// Workers AI returns either a raw string or { response: string } depending on model
const extractAIText = (response: unknown): string => {
  if (typeof response === 'string') return response;
  if (typeof response === 'object' && response !== null && 'response' in response && typeof response.response === 'string') return response.response;
  return '';
};

// GitHub also returns PENDING/DISMISSED; only these states are stored
const STORABLE_REVIEW_STATES = ['APPROVED', 'CHANGES_REQUESTED', 'COMMENTED'] as const;
type StorableReviewState = (typeof STORABLE_REVIEW_STATES)[number];
const isStorableReviewState = (value: string): value is StorableReviewState => STORABLE_REVIEW_STATES.some(state => state === value);

interface RepoSyncResult {
  repos: Repo[];
  requestCount: number;
  rateLimit: GraphQLRateLimit;
}

export class SkillsAnalysisWorkflow extends WorkflowEntrypoint<WorkflowEnv, void> {
  // Per-step rule: a fresh connectionless client created inside each step.do
  private getDb(): DB {
    return drizzle(this.env.SKILLS_DB, { schema, casing: 'snake_case' });
  }

  override async run(event: WorkflowEvent<void>, step: WorkflowStep) {
    const { instanceId } = event;

    // Step 1: Acquire lock (singleton enforcement)
    const lockAcquired = await step.do('acquire_lock', async () => await this.acquireLock(instanceId));

    if (!lockAcquired) {
      console.log('Another workflow instance is already running. Exiting.');
      return;
    }

    // Counters are accumulated from step return values, never instance fields:
    // on hibernation/replay a cached step.do returns without re-running, so
    // mutations to `this` would be silently lost.
    let requestCount = 0;
    let processedRepos = 0;

    try {
      // Load rate limit metrics from KV inside a step (durable, retried)
      const metrics = await step.do('load_rate_limit_metrics', async () => {
        const stored = await this.env.CACHE.get<RateLimitMetrics>(RATE_LIMIT_METRICS_KEY, 'json');
        return stored ?? DEFAULT_RATE_LIMIT_METRICS;
      });

      // Step 2: Sync repos from GitHub (no sleep inside the step - sleepUntil
      // must live at run() level so a hibernation doesn't replay the whole
      // pagination from scratch)
      const repoSync = await step.do('sync_repos', async () => {
        const db = this.getDb();
        await this.updateState(db, 'listing-repos', 5);
        return await this.syncRepos(db);
      });

      const repoList = repoSync.repos;
      const totalRepos = repoList.length;
      requestCount += repoSync.requestCount;

      await this.maybeSleep(step, repoSync.rateLimit, metrics, totalRepos, processedRepos, 'repos_sleep');

      // Step 3: Sync commits for each repo
      for (let i = 0; i < repoList.length; i++) {
        const repo = repoList[i];
        if (!repo) continue;

        const result = await step.do(`sync_commits_${repo.githubId}`, async () => {
          const db = this.getDb();
          // Never write the raw name of a private/hidden-org repo into
          // workflow_state - it is served verbatim to the public /skills page
          await this.updateState(db, 'fetching-commits', 10 + Math.floor((i / repoList.length) * 25), getRepoDisplayName(repo), totalRepos, i);
          return await this.syncCommits(db, repo);
        });

        processedRepos++;
        requestCount += result.requestCount;

        await this.maybeSleep(step, result.rateLimit, metrics, totalRepos, processedRepos, `commits_sleep_${repo.githubId}`);
      }

      // Step 4: Sync PRs and reviews for each repo
      for (let i = 0; i < repoList.length; i++) {
        const repo = repoList[i];
        if (!repo) continue;

        const result = await step.do(`sync_prs_${repo.githubId}`, async () => {
          const db = this.getDb();
          await this.updateState(db, 'fetching-prs', 35 + Math.floor((i / repoList.length) * 20), getRepoDisplayName(repo));
          return await this.syncPRsAndReviews(db, repo);
        });

        requestCount += result.requestCount;

        await this.maybeSleep(step, result.rateLimit, metrics, totalRepos, processedRepos, `prs_sleep_${repo.githubId}`);
      }

      // Step 5: Finalize sync state
      await step.do('finalize_sync', async () => {
        const db = this.getDb();
        await this.updateState(db, 'fetching-reviews', 55);
        await this.finalizeSyncState(db, repoList);
      });

      // AI Steps: Squash history for AI context
      const summary = await step.do('squash_history', async () => {
        const db = this.getDb();
        await this.updateState(db, 'squashing-history', 60);
        return await this.squashHistory(db);
      });

      // AI Step: Extract skills
      const skills = await step.do('ai_extract_skills', async () => {
        const db = this.getDb();
        await this.updateState(db, 'ai-extracting-skills', 70);
        try {
          return await this.extractSkillsWithAI(summary);
        } catch (error) {
          console.error('AI skill extraction failed:', error);
          return [];
        }
      });

      // AI Step: Generate Japanese descriptions
      const content = await step.do('ai_generate_japanese', async () => {
        const db = this.getDb();
        await this.updateState(db, 'ai-generating-japanese', 85);
        try {
          return await this.generateJapaneseDescriptions(db, skills, summary);
        } catch (error) {
          console.error('AI Japanese generation failed:', error);
          return this.createFallbackContent(db, skills);
        }
      });

      // Final Step: Store results
      await step.do('store_results', async () => {
        const db = this.getDb();
        await this.updateState(db, 'storing-results', 95);
        await this.storeResults(db, content);
        await this.updateState(db, 'completed', 100);
      });

      // Persist rate-limit metrics for the next run's dynamic threshold
      await step.do('store_rate_limit_metrics', async () => {
        if (totalRepos > 0 && requestCount > 0) {
          const newMetrics: RateLimitMetrics = {
            avgRequestsPerRepo: requestCount / totalRepos,
            lastRunRepoCount: totalRepos,
            lastRunRequestCount: requestCount,
            updatedAt: new Date().toISOString(),
          };
          await this.env.CACHE.put(RATE_LIMIT_METRICS_KEY, JSON.stringify(newMetrics));
        }
      });
    } catch (error) {
      // Surface the failure - otherwise the phase sticks at its last value,
      // the UI reads "running" forever, and re-runs are blocked
      await step.do('mark_error', async () => {
        const db = this.getDb();
        const message = error instanceof Error ? error.message : String(error);
        await db.update(workflowState).set({ phase: 'error', errorMessage: message }).where(eq(workflowState.id, 1));
        await this.env.CACHE.delete(WORKFLOW_STATE_KV_KEY);
      });
      throw error;
    } finally {
      // Always release the lock, in a step so it is retried and not re-run on replay
      await step.do('release_lock', async () => {
        await this.releaseLock(instanceId);
      });
    }
  }

  private async acquireLock(instanceId: string): Promise<boolean> {
    const existingLock = await this.env.CACHE.get<WorkflowLock>(WORKFLOW_LOCK_KEY, 'json');

    if (existingLock) {
      // Check if the existing workflow is still running
      try {
        const existingInstance = await this.env.SKILLS_WORKFLOW.get(existingLock.instanceId);
        const status = await existingInstance.status();

        if (status.status === 'running' || status.status === 'queued' || status.status === 'paused') {
          // Still running, don't acquire lock
          return false;
        }
        // Workflow completed/errored/terminated, we can take over
      } catch {
        // Instance not found or error checking, assume we can take over
      }
    }

    // Acquire lock with 24-hour TTL
    const lock: WorkflowLock = {
      instanceId,
      startedAt: new Date().toISOString(),
    };
    await this.env.CACHE.put(WORKFLOW_LOCK_KEY, JSON.stringify(lock), {
      expirationTtl: 86400, // 24 hours
    });

    return true;
  }

  private async releaseLock(instanceId: string): Promise<void> {
    const existingLock = await this.env.CACHE.get<WorkflowLock>(WORKFLOW_LOCK_KEY, 'json');

    // Only release if we own the lock
    if (existingLock?.instanceId === instanceId) await this.env.CACHE.delete(WORKFLOW_LOCK_KEY);
  }

  private async syncRepos(db: DB): Promise<RepoSyncResult> {
    const octokit = createGitHubClient(this.env.GITHUB_PAT);
    const repoList: Repo[] = [];
    let requestCount = 0;
    let rateLimit: GraphQLRateLimit;
    let cursor;

    do {
      const { data, rateLimit: pageRateLimit } = await fetchUserRepos(octokit, cursor);
      rateLimit = pageRateLimit;
      requestCount++;

      const nodes = data.viewer.repositories.nodes ?? [];

      for (const node of nodes) {
        if (!node) continue;

        const record = await this.upsertRepo(db, {
          id: node.databaseId!,
          full_name: node.nameWithOwner,
          name: node.name,
          owner: node.nameWithOwner.split('/')[0]!,
          private: node.isPrivate,
          fork: node.isFork,
          default_branch: node.defaultBranchRef?.name ?? 'main',
          language: node.primaryLanguage?.name ?? null,
          created_at: node.createdAt,
          updated_at: node.updatedAt,
        });
        repoList.push(record);
      }

      cursor = data.viewer.repositories.pageInfo.hasNextPage ? (data.viewer.repositories.pageInfo.endCursor ?? undefined) : undefined;
    } while (cursor);

    return { repos: repoList, requestCount, rateLimit };
  }

  private async upsertRepo(
    db: DB,
    repo: {
      id: number;
      full_name: string;
      name: string;
      owner: string;
      private: boolean;
      fork: boolean;
      default_branch: string;
      language: string | null;
      created_at: string;
      updated_at: string;
    },
  ): Promise<Repo> {
    const privacyClass = classifyRepo({
      id: repo.id,
      full_name: repo.full_name,
      name: repo.name,
      owner: { login: repo.owner },
      private: repo.private,
      fork: repo.fork,
      default_branch: repo.default_branch,
      language: repo.language,
      created_at: repo.created_at,
      updated_at: repo.updated_at,
    });

    await db
      .insert(repos)
      .values({
        githubId: repo.id,
        fullName: repo.full_name,
        name: repo.name,
        owner: repo.owner,
        isPrivate: repo.private,
        isFork: repo.fork,
        privacyClass,
        defaultBranch: repo.default_branch,
        language: repo.language,
        createdAt: repo.created_at,
        updatedAt: repo.updated_at,
      })
      .onConflictDoUpdate({
        target: repos.githubId,
        set: {
          fullName: repo.full_name,
          isPrivate: repo.private,
          privacyClass,
          language: repo.language,
          updatedAt: repo.updated_at,
          fetchedAt: sql`datetime('now')`,
        },
      });

    // Read back the upserted row; guard instead of asserting non-null so a
    // failed insert surfaces as an explicit error rather than a crash
    const record = await db.select().from(repos).where(eq(repos.githubId, repo.id)).get();
    if (!record) throw new Error(`upsertRepo: row not found after upsert for githubId=${repo.id}`);
    return record;
  }

  private async syncCommits(db: DB, repo: Repo): Promise<{ rateLimit: GraphQLRateLimit; requestCount: number }> {
    const octokit = createGitHubClient(this.env.GITHUB_PAT);

    // Incremental cursor lives on the repo row itself (preserved across upserts)
    const since = repo.lastCommitAt ?? undefined;
    let cursor = repo.commitsCursor ?? undefined;
    let lastRateLimit: GraphQLRateLimit = { remaining: 5000, cost: 1, resetAt: 0 };
    let requestCount = 0;
    let latestCommitDate;
    const rows: (typeof commits.$inferInsert)[] = [];

    try {
      do {
        const { data, rateLimit } = await fetchRepoCommits(octokit, repo.owner, repo.name, since, cursor);
        lastRateLimit = rateLimit;
        requestCount++;

        const target = data.repository?.defaultBranchRef?.target;
        if (!target || !('history' in target)) break;

        const commitNodes = target.history.nodes ?? [];

        for (const node of commitNodes) {
          if (!node) continue;

          // Filter by user login
          if (!isPRAuthoredByUser(node.author?.user?.login)) continue;

          // Track latest commit date
          if (!latestCommitDate || node.committedDate > latestCommitDate) latestCommitDate = node.committedDate;

          rows.push({
            sha: node.oid,
            repoId: repo.id,
            message: node.messageHeadline,
            authorDate: node.committedDate,
            additions: node.additions,
            deletions: node.deletions,
            filesChanged: node.changedFilesIfAvailable ?? 0,
          });
        }

        cursor = target.history.pageInfo.hasNextPage ? (target.history.pageInfo.endCursor ?? undefined) : undefined;
      } while (cursor);

      // One batched insert instead of a round trip per commit
      if (rows.length > 0) await db.insert(commits).values(rows).onConflictDoNothing();

      // Update repo with latest commit date
      if (latestCommitDate) await db.update(repos).set({ lastCommitAt: latestCommitDate }).where(eq(repos.id, repo.id));
    } catch (error) {
      // Log error but continue with partial data
      console.error(`Error syncing commits for ${repo.fullName}:`, error);
    }

    return { rateLimit: lastRateLimit, requestCount };
  }

  private async syncPRsAndReviews(db: DB, repo: Repo): Promise<{ rateLimit: GraphQLRateLimit; requestCount: number }> {
    const octokit = createGitHubClient(this.env.GITHUB_PAT);

    // Incremental cursor lives on the repo row itself
    const lastPrUpdatedAt = repo.lastPrUpdatedAt ?? undefined;
    let cursor = repo.prsCursor ?? undefined;
    let lastRateLimit: GraphQLRateLimit = { remaining: 5000, cost: 1, resetAt: 0 };
    let requestCount = 0;
    let latestPrUpdatedAt;

    try {
      do {
        const { data, rateLimit } = await fetchRepoPRs(octokit, repo.owner, repo.name, cursor);
        lastRateLimit = rateLimit;
        requestCount++;

        const prNodes = data.repository?.pullRequests.nodes ?? [];
        let reachedOldData = false;

        for (const pr of prNodes) {
          if (!pr) continue;

          // For incremental sync: stop if we reach PRs older than last sync
          if (lastPrUpdatedAt && pr.updatedAt < lastPrUpdatedAt) {
            reachedOldData = true;
            break;
          }

          // Track latest PR update
          if (!latestPrUpdatedAt || pr.updatedAt > latestPrUpdatedAt) latestPrUpdatedAt = pr.updatedAt;

          // Only upsert PRs authored by the user
          if (isPRAuthoredByUser(pr.author?.login)) {
            await this.upsertPR(db, repo.id, {
              githubId: pr.databaseId!,
              number: pr.number,
              title: pr.title,
              body: pr.body ?? undefined,
              state: pr.state,
              merged: pr.merged,
              additions: pr.additions,
              deletions: pr.deletions,
              changedFiles: pr.changedFiles,
              commitsCount: pr.commits.totalCount,
              createdAt: pr.createdAt,
              mergedAt: pr.mergedAt ?? null,
              closedAt: pr.closedAt ?? null,
            });
          }

          // Process reviews on all PRs (user may have reviewed others' PRs)
          const reviewNodes = pr.reviews?.nodes ?? [];
          for (const review of reviewNodes) {
            if (!review) continue;

            // Only store reviews by the user
            if (!isPRAuthoredByUser(review.author?.login)) continue;

            // Skip reviews without submittedAt (pending reviews)
            if (!review.submittedAt) continue;

            await this.upsertReview(db, repo.id, pr.number, pr.title, {
              githubId: review.databaseId!,
              state: review.state,
              body: review.body ?? undefined,
              submittedAt: review.submittedAt,
            });
          }
        }

        if (reachedOldData) break;

        cursor = data.repository?.pullRequests.pageInfo.hasNextPage === true ? (data.repository.pullRequests.pageInfo.endCursor ?? undefined) : undefined;
      } while (cursor);

      // Update repo with latest PR update time
      if (latestPrUpdatedAt) await db.update(repos).set({ lastPrUpdatedAt: latestPrUpdatedAt }).where(eq(repos.id, repo.id));
    } catch (error) {
      console.error(`Error syncing PRs for ${repo.fullName}:`, error);
    }

    return { rateLimit: lastRateLimit, requestCount };
  }

  private async upsertPR(
    db: DB,
    repoId: number,
    pr: {
      githubId: number;
      number: number;
      title: string;
      body: string | null;
      state: string;
      merged: boolean;
      additions: number;
      deletions: number;
      changedFiles: number;
      commitsCount: number;
      createdAt: string;
      mergedAt: string | null;
      closedAt: string | null;
    },
  ) {
    await db
      .insert(pullRequests)
      .values({
        githubId: pr.githubId,
        repoId,
        number: pr.number,
        title: pr.title,
        body: pr.body,
        state: pr.state,
        merged: pr.merged,
        additions: pr.additions,
        deletions: pr.deletions,
        changedFiles: pr.changedFiles,
        commitsCount: pr.commitsCount,
        commentsCount: 0, // Not fetched via GraphQL
        reviewCommentsCount: 0,
        createdAt: pr.createdAt,
        mergedAt: pr.mergedAt,
        closedAt: pr.closedAt,
      })
      .onConflictDoUpdate({
        target: pullRequests.githubId,
        set: {
          state: pr.state,
          merged: pr.merged,
          mergedAt: pr.mergedAt,
          closedAt: pr.closedAt,
          fetchedAt: sql`datetime('now')`,
        },
      });
  }

  private async upsertReview(
    db: DB,
    repoId: number,
    prNumber: number,
    prTitle: string,
    review: {
      githubId: number;
      state: string;
      body: string | null;
      submittedAt: string;
    },
  ) {
    if (!isStorableReviewState(review.state)) return;

    await db
      .insert(prReviews)
      .values({
        githubId: review.githubId,
        repoId,
        prNumber,
        prTitle,
        state: review.state,
        body: review.body,
        submittedAt: review.submittedAt,
      })
      .onConflictDoNothing();
  }

  private async finalizeSyncState(db: DB, repoList: Repo[]): Promise<void> {
    // Clear cursors after successful sync - single UPDATE over all synced repos
    const ids = repoList.map(repo => repo.id);
    if (ids.length === 0) return;

    await db.update(repos).set({ commitsCursor: null, prsCursor: null }).where(inArray(repos.id, ids));
  }

  // Sleep until the GitHub rate limit resets if we're below the dynamic
  // threshold. Called at run() level (never nested inside a step.do) so a
  // hibernation here doesn't replay a half-finished step.
  private async maybeSleep(
    step: WorkflowStep,
    rateLimit: GraphQLRateLimit,
    metrics: RateLimitMetrics,
    totalRepos: number,
    processedRepos: number,
    stepName: string,
  ): Promise<void> {
    const threshold = calculateDynamicThreshold(metrics, totalRepos, processedRepos);

    if (rateLimit.remaining < threshold) {
      const resetDate = new Date(rateLimit.resetAt * 1000);

      // Skip if reset time is in the past
      if (resetDate.getTime() > Date.now()) {
        console.log(`Rate limit low (${rateLimit.remaining}/${threshold}). Sleeping until ${resetDate.toISOString()}`);
        await step.sleepUntil(stepName, resetDate);
      }
    }
  }

  private async updateState(db: DB, phase: WorkflowPhase, progress: number, currentRepo?: string, total?: number, processed?: number) {
    const updates: Partial<{
      phase: string;
      progressPct: number;
      currentRepo: string | null;
      reposTotal: number;
      reposProcessed: number;
      lastCompletedAt: ReturnType<typeof sql>;
      errorMessage: string | null;
    }> = {
      phase,
      progressPct: progress,
      // Forward progress means any previous run's error is stale
      errorMessage: null,
    };

    if (currentRepo !== undefined) updates.currentRepo = currentRepo;

    if (total !== undefined) updates.reposTotal = total;

    if (processed !== undefined) updates.reposProcessed = processed;

    if (phase === 'completed') updates.lastCompletedAt = sql`datetime('now')`;

    await db.update(workflowState).set(updates).where(eq(workflowState.id, 1));
  }

  private async squashHistory(db: DB): Promise<string> {
    // Get aggregate stats
    const [commitCount, prCount, reviewCount, reposWithCommits] = await Promise.all([
      db.select({ count: count() }).from(commits).get(),
      db.select({ count: count() }).from(pullRequests).get(),
      db.select({ count: count() }).from(prReviews).get(),
      db.selectDistinct({ repoId: commits.repoId }).from(commits).all(),
    ]);

    const stats = {
      total_commits: commitCount?.count ?? 0,
      total_prs: prCount?.count ?? 0,
      total_reviews: reviewCount?.count ?? 0,
      repos_with_commits: reposWithCommits.length,
    };

    // Get language distribution
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

    // Get recent activity summary (last 6 months)
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

    // Get PR patterns
    const prPatterns = await db
      .select({
        state: pullRequests.state,
        merged: pullRequests.merged,
        avg_changes: sql<number>`AVG(${pullRequests.additions} + ${pullRequests.deletions})`,
        count: count(),
      })
      .from(pullRequests)
      .groupBy(pullRequests.state, pullRequests.merged)
      .all();

    // Get review patterns
    const reviewPatterns = await db.select({ state: prReviews.state, count: count() }).from(prReviews).groupBy(prReviews.state).all();

    // Build summary text (fits in AI context)
    const privateRepos = await db
      .select({ fullName: repos.fullName })
      .from(repos)
      .where(inArray(repos.privacyClass, ['private', 'member-org']))
      .all();

    const privateNames = privateRepos.map((r: { fullName: string }) => r.fullName);

    let summary = `# GitHub Activity Summary for ${GITHUB_USERNAME}

## Overview
- Total commits analyzed: ${stats.total_commits}
- Total PRs authored: ${stats.total_prs}
- Total PR reviews given: ${stats.total_reviews}
- Repositories with commits: ${stats.repos_with_commits}

## Language Distribution (by lines changed)
${languages.map((l: { language: string | null; commit_count: number; lines_changed: string | number | null }) => `- ${l.language}: ${l.commit_count} commits, ${l.lines_changed} lines`).join('\n')}

## Recent Activity (Last 6 Months)
${recentActivity.map((a: { language: string | null; commits: number; privacy_class: string }) => `- ${a.language ?? 'Unknown'}: ${a.commits} commits (${a.privacy_class})`).join('\n')}

## PR Patterns
${prPatterns.map((p: { state: string; merged: boolean; avg_changes: number; count: number }) => `- ${p.state}${p.merged ? ' (merged)' : ''}: ${p.count} PRs, avg ${Math.round(p.avg_changes)} lines`).join('\n')}

## Review Patterns
${reviewPatterns.map((r: { state: string; count: number }) => `- ${r.state}: ${r.count} reviews`).join('\n')}
`;

    // Sanitize for privacy
    summary = sanitizeForAI(summary, privateNames);

    // Store summary
    await db
      .insert(historySummaries)
      .values({
        summaryType: 'overall',
        timeRange: 'all',
        content: summary,
        tokenEstimate: Math.ceil(summary.length / 4),
      })
      .onConflictDoUpdate({
        target: [historySummaries.summaryType, historySummaries.timeRange],
        set: {
          content: summary,
          tokenEstimate: Math.ceil(summary.length / 4),
          createdAt: sql`datetime('now')`,
        },
      });

    return summary;
  }

  private async extractSkillsWithAI(summary: string): Promise<AISkill[]> {
    const prompt = `You are analyzing a developer's GitHub activity to extract their skills. Be BRUTALLY HONEST about skill levels - don't inflate. Base assessments purely on evidence.

${summary}

Extract skills and categorize them. For each skill:
- name: Technology/skill name
- category: "language", "infrastructure", or "domain"
- level: "expert" (deep mastery, years of production use), "proficient" (solid working knowledge), or "learning" (actively learning, limited production use)
- confidence: 0-1 how confident you are in this assessment
- evidence: 2-3 key evidence points (anonymize private repo references)
- trend: "rising" (increasing activity), "stable", or "declining" (decreasing activity)

Be harsh. If someone has 10 commits in a language, they're "learning" not "proficient".
If there's little evidence, confidence should be low.

Output as JSON array of skills. Nothing else.`;

    const response = await this.env.AI.run('@cf/qwen/qwen3-30b-a3b-fp8', {
      prompt,
      max_tokens: 4096,
    });

    // Extract JSON from response (AI might include markdown)
    const jsonMatch = /\[[\s\S]*\]/.exec(extractAIText(response));
    if (!jsonMatch) return [];

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      return [];
    }
    if (!Array.isArray(parsed)) return [];

    // Validate at the model boundary; drop entries that don't match the contract
    const now = new Date().toISOString();
    const skills: AISkill[] = [];
    for (const entry of parsed) {
      if (!isAISkillDraft(entry)) continue;
      skills.push({
        name: entry.name,
        category: entry.category,
        level: entry.level,
        confidence: entry.confidence,
        evidence: entry.evidence,
        trend: entry.trend,
        description_ja: '',
        last_active: now,
        is_ai_discovered: true,
      });
    }
    return skills;
  }

  private async generateJapaneseDescriptions(db: DB, skills: AISkill[], summary: string): Promise<AISkillsContent> {
    // Generate descriptions for each skill
    for (const skill of skills) {
      const prompt = `あなたはプロフェッショナルなテクニカルライターです。以下のスキル情報を元に、日本語でスキルの説明文を書いてください。

スキル名: ${skill.name}
カテゴリ: ${skill.category}
レベル: ${skill.level}
証拠: ${skill.evidence.join(', ')}
トレンド: ${skill.trend}

要件:
- 2-3文で簡潔に
- 事実ベースで、誇張しない
- プロフェッショナルかつ少し遊び心を持って
- 日本語のみ、英語は含めない

説明文だけを出力してください。`;

      try {
        const response = await this.env.AI.run('@cf/google/gemma-3-12b-it', {
          prompt,
          max_tokens: 512,
        });

        skill.description_ja = extractAIText(response).trim();
      } catch (error) {
        console.error(`Error generating Japanese for skill ${skill.name}:`, error);
        skill.description_ja = `${skill.name}のスキル`;
      }
    }

    // Generate profile summary
    const profilePrompt = `あなたはプロフェッショナルなテクニカルライターです。以下の開発者のGitHub活動サマリーを元に、日本語でプロフィールを書いてください。

${summary}

以下の3つを出力してください（JSONフォーマット）:
1. summary_ja: 全体的なプロフィール（3-4文）
2. activity_narrative_ja: 最近の活動について（1-2文、「最近は〜に注力している」のような形式）
3. skill_comparison_ja: スキルの比較（1文、「〜が最も強く、〜が成長中」のような形式）

JSONのみ出力してください。`;

    let profile: AIProfileSummary;
    try {
      const profileResponse = await this.env.AI.run('@cf/google/gemma-3-12b-it', {
        prompt: profilePrompt,
        max_tokens: 1024,
      });

      const jsonMatch = /\{[\s\S]*\}/.exec(extractAIText(profileResponse));
      const parsed: unknown = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
      if (!isAIProfileDraft(parsed)) throw new Error('AI profile response failed validation');

      profile = {
        ...parsed,
        generated_at: new Date().toISOString(),
        model_used: '@cf/google/gemma-3-12b-it',
      };
    } catch {
      profile = {
        summary_ja: 'プロフィール生成中にエラーが発生しました。',
        activity_narrative_ja: '',
        skill_comparison_ja: '',
        generated_at: new Date().toISOString(),
        model_used: '@cf/google/gemma-3-12b-it',
      };
    }

    // Get stats for content
    const [commitCount, prCount, reviewCount] = await Promise.all([
      db.select({ count: count() }).from(commits).get(),
      db.select({ count: count() }).from(pullRequests).get(),
      db.select({ count: count() }).from(prReviews).get(),
    ]);

    const content: AISkillsContent = {
      skills,
      generated_at: new Date().toISOString(),
      model_used: '@cf/qwen/qwen3-30b-a3b-fp8',
      total_commits_analyzed: commitCount?.count ?? 0,
      total_prs_analyzed: prCount?.count ?? 0,
      total_reviews_analyzed: reviewCount?.count ?? 0,
    };

    // Store profile to KV
    await this.env.CACHE.put('ai_profile_summary_ja', JSON.stringify(profile), {
      expirationTtl: 60 * 60 * 24 * 30,
    });

    return content;
  }

  private async createFallbackContent(db: DB, skills: AISkill[]): Promise<AISkillsContent> {
    const [commitCount, prCount, reviewCount] = await Promise.all([
      db.select({ count: count() }).from(commits).get(),
      db.select({ count: count() }).from(pullRequests).get(),
      db.select({ count: count() }).from(prReviews).get(),
    ]);

    return {
      skills,
      generated_at: new Date().toISOString(),
      model_used: '@cf/qwen/qwen3-30b-a3b-fp8',
      total_commits_analyzed: commitCount?.count ?? 0,
      total_prs_analyzed: prCount?.count ?? 0,
      total_reviews_analyzed: reviewCount?.count ?? 0,
    };
  }

  private async storeResults(db: DB, content: AISkillsContent) {
    await this.env.CACHE.put('ai_skills_content_ja', JSON.stringify(content), {
      expirationTtl: 60 * 60 * 24 * 30,
    });

    const state = await db.select().from(workflowState).where(eq(workflowState.id, 1)).get();
    if (state) {
      // Write the snake_case wire shape, not the raw camelCase row -
      // the /skills loader reads this key as WorkflowState
      await this.env.CACHE.put(WORKFLOW_STATE_KV_KEY, JSON.stringify(mapWorkflowStateRow(state)), {
        expirationTtl: WORKFLOW_STATE_KV_TTL_SECONDS,
      });
    }
  }
}
