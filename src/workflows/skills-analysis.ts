// Cloudflare Workflow for AI Skills Analysis
// Uses GitHub GraphQL API with sleepUntil for rate limits
// Supports incremental syncing and singleton execution

import type { Repo } from '#db/types';
import type { AIProfileSummary, AISkill, AISkillsContent, WorkflowPhase } from './-utils/ai-skills-types';
import type { DrizzleD1Database } from 'drizzle-orm/d1';

import { WorkflowEntrypoint, type WorkflowEvent, type WorkflowStep } from 'cloudflare:workers';
import { count, eq, inArray, sql, sum } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';

import * as schema from '#db/schema';
import { commits, historySummaries, prReviews, pullRequests, repos, workflowState } from '#db/schema';

import {
  DEFAULT_RATE_LIMIT_METRICS,
  GITHUB_USERNAME,
  type GraphQLRateLimit,
  type RateLimitMetrics,
  calculateDynamicThreshold,
  createGitHubClient,
  fetchRepoCommits,
  fetchRepoPRs,
  fetchUserRepos,
  isAuthoredByUser,
  isPRAuthoredByUser,
} from './-utils/github-graphql';
import { classifyRepo, sanitizeForAI } from './-utils/privacy-filter';

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

interface SyncState {
  repos: Array<{
    id: number;
    githubId: number;
    fullName: string;
    owner: string;
    name: string;
    lastCommitAt: string | null;
    lastPrUpdatedAt: string | null;
    commitsCursor: string | null;
    prsCursor: string | null;
  }>;
  userEmail: string | null;
  totalRepos: number;
}

export class SkillsAnalysisWorkflow extends WorkflowEntrypoint<WorkflowEnv, void> {
  private metrics: RateLimitMetrics = DEFAULT_RATE_LIMIT_METRICS;
  private processedRepos = 0;
  private totalRepos = 0;
  private requestCount = 0;

  override async run(event: WorkflowEvent<void>, step: WorkflowStep) {
    const instanceId = event.instanceId;

    // Step 1: Acquire lock (singleton enforcement)
    const lockAcquired = await step.do('acquire_lock', async () => {
      return await this.acquireLock(instanceId);
    });

    if (!lockAcquired) {
      console.log('Another workflow instance is already running. Exiting.');
      return;
    }

    try {
      // Step 2: Load sync state
      const syncState = await step.do('load_sync_state', async () => {
        const db = drizzle(this.env.SKILLS_DB, { schema, casing: 'snake_case' });
        await this.updateState(db, 'listing-repos', 0);
        return await this.loadSyncState(db);
      });

      this.totalRepos = syncState.totalRepos;

      // Load rate limit metrics from KV
      const storedMetrics = await this.env.CACHE.get<RateLimitMetrics>(RATE_LIMIT_METRICS_KEY, 'json');
      if (storedMetrics) {
        this.metrics = storedMetrics;
      }

      // Step 3: Sync repos from GitHub
      const repoList = await step.do('sync_repos', async () => {
        const db = drizzle(this.env.SKILLS_DB, { schema, casing: 'snake_case' });
        await this.updateState(db, 'listing-repos', 5);
        return await this.syncRepos(db, step, syncState.userEmail);
      });

      this.totalRepos = repoList.length;

      // Step 4: Sync commits for each repo
      for (let i = 0; i < repoList.length; i++) {
        const repo = repoList[i];
        if (!repo) continue;

        const result = await step.do(`sync_commits_${repo.githubId}`, async () => {
          const db = drizzle(this.env.SKILLS_DB, { schema, casing: 'snake_case' });
          await this.updateState(db, 'fetching-commits', 10 + Math.floor((i / repoList.length) * 25), repo.fullName, repoList.length, i);
          return await this.syncCommits(db, repo, syncState);
        });

        this.processedRepos++;
        this.requestCount += result.requestCount;

        await this.checkRateLimitAndSleep(step, result.rateLimit, `commits_sleep_${repo.githubId}`);
      }

      // Step 5: Sync PRs and reviews for each repo
      for (let i = 0; i < repoList.length; i++) {
        const repo = repoList[i];
        if (!repo) continue;

        const result = await step.do(`sync_prs_${repo.githubId}`, async () => {
          const db = drizzle(this.env.SKILLS_DB, { schema, casing: 'snake_case' });
          await this.updateState(db, 'fetching-prs', 35 + Math.floor((i / repoList.length) * 20), repo.fullName);
          return await this.syncPRsAndReviews(db, repo, syncState);
        });

        this.requestCount += result.requestCount;

        await this.checkRateLimitAndSleep(step, result.rateLimit, `prs_sleep_${repo.githubId}`);
      }

      // Step 6: Finalize sync state
      await step.do('finalize_sync', async () => {
        const db = drizzle(this.env.SKILLS_DB, { schema, casing: 'snake_case' });
        await this.updateState(db, 'fetching-reviews', 55);
        await this.finalizeSyncState(db, repoList);
      });

      // AI Steps: Squash history for AI context
      const summary = await step.do('squash_history', async () => {
        const db = drizzle(this.env.SKILLS_DB, { schema, casing: 'snake_case' });
        await this.updateState(db, 'squashing-history', 60);
        return await this.squashHistory(db);
      });

      // AI Step: Extract skills
      const skills = await step.do('ai_extract_skills', async () => {
        const db = drizzle(this.env.SKILLS_DB, { schema, casing: 'snake_case' });
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
        const db = drizzle(this.env.SKILLS_DB, { schema, casing: 'snake_case' });
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
        const db = drizzle(this.env.SKILLS_DB, { schema, casing: 'snake_case' });
        await this.updateState(db, 'storing-results', 95);
        await this.storeResults(db, content);
        await this.updateState(db, 'completed', 100);
      });
    } finally {
      // Always release lock
      await this.releaseLock(instanceId);

      // Update rate limit metrics
      if (this.totalRepos > 0 && this.requestCount > 0) {
        const newMetrics: RateLimitMetrics = {
          avgRequestsPerRepo: this.requestCount / this.totalRepos,
          lastRunRepoCount: this.totalRepos,
          lastRunRequestCount: this.requestCount,
          updatedAt: new Date().toISOString(),
        };
        await this.env.CACHE.put(RATE_LIMIT_METRICS_KEY, JSON.stringify(newMetrics));
      }
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
    if (existingLock?.instanceId === instanceId) {
      await this.env.CACHE.delete(WORKFLOW_LOCK_KEY);
    }
  }

  private async loadSyncState(db: DB): Promise<SyncState> {
    const repoData = await db
      .select({
        id: repos.id,
        githubId: repos.githubId,
        fullName: repos.fullName,
        owner: repos.owner,
        name: repos.name,
        lastCommitAt: repos.lastCommitAt,
        lastPrUpdatedAt: repos.lastPrUpdatedAt,
        commitsCursor: repos.commitsCursor,
        prsCursor: repos.prsCursor,
      })
      .from(repos)
      .all();

    return {
      repos: repoData,
      userEmail: null, // Will be populated from GraphQL response
      totalRepos: repoData.length,
    };
  }

  private async syncRepos(db: DB, step: WorkflowStep, userEmail: string | null): Promise<Repo[]> {
    const octokit = createGitHubClient(this.env.GITHUB_PAT);
    const repoList: Repo[] = [];
    let cursor: string | null = null;
    let fetchedUserEmail = userEmail;

    do {
      const { data, rateLimit } = await fetchUserRepos(octokit, cursor);
      this.requestCount++;

      // Capture user email from first response
      if (!fetchedUserEmail && data.viewer.email) {
        fetchedUserEmail = data.viewer.email;
      }

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

      cursor = data.viewer.repositories.pageInfo.hasNextPage ? (data.viewer.repositories.pageInfo.endCursor ?? null) : null;

      await this.checkRateLimitAndSleep(step, rateLimit, `repos_sleep_${cursor ?? 'final'}`);
    } while (cursor);

    return repoList;
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

    const result = await db.select().from(repos).where(eq(repos.githubId, repo.id)).get();

    return result!;
  }

  private async syncCommits(db: DB, repo: Repo, syncState: SyncState): Promise<{ rateLimit: GraphQLRateLimit; requestCount: number }> {
    const octokit = createGitHubClient(this.env.GITHUB_PAT);

    // Find existing sync state for this repo
    const existingState = syncState.repos.find(r => r.githubId === repo.githubId);
    const since = existingState?.lastCommitAt ?? null;
    let cursor = existingState?.commitsCursor ?? null;
    let lastRateLimit: GraphQLRateLimit = { remaining: 5000, cost: 1, resetAt: 0 };
    let requestCount = 0;
    let latestCommitDate: string | null = null;

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

          // Filter by user email
          if (!isAuthoredByUser(node.author?.email, syncState.userEmail)) continue;

          // Track latest commit date
          if (!latestCommitDate || node.committedDate > latestCommitDate) {
            latestCommitDate = node.committedDate;
          }

          await this.upsertCommit(db, repo.id, {
            sha: node.oid,
            message: node.messageHeadline,
            authorDate: node.committedDate,
            additions: node.additions,
            deletions: node.deletions,
            filesChanged: node.changedFilesIfAvailable ?? 0,
          });
        }

        cursor = target.history.pageInfo.hasNextPage ? (target.history.pageInfo.endCursor ?? null) : null;
      } while (cursor);

      // Update repo with latest commit date
      if (latestCommitDate) {
        await db.update(repos).set({ lastCommitAt: latestCommitDate }).where(eq(repos.id, repo.id));
      }
    } catch (error) {
      // Log error but continue with partial data
      console.error(`Error syncing commits for ${repo.fullName}:`, error);
    }

    return { rateLimit: lastRateLimit, requestCount };
  }

  private async upsertCommit(
    db: DB,
    repoId: number,
    commit: {
      sha: string;
      message: string;
      authorDate: string;
      additions: number;
      deletions: number;
      filesChanged: number;
    },
  ) {
    await db
      .insert(commits)
      .values({
        sha: commit.sha,
        repoId,
        message: commit.message,
        authorDate: commit.authorDate,
        additions: commit.additions,
        deletions: commit.deletions,
        filesChanged: commit.filesChanged,
      })
      .onConflictDoNothing();
  }

  private async syncPRsAndReviews(db: DB, repo: Repo, syncState: SyncState): Promise<{ rateLimit: GraphQLRateLimit; requestCount: number }> {
    const octokit = createGitHubClient(this.env.GITHUB_PAT);

    const existingState = syncState.repos.find(r => r.githubId === repo.githubId);
    const lastPrUpdatedAt = existingState?.lastPrUpdatedAt ?? null;
    let cursor = existingState?.prsCursor ?? null;
    let lastRateLimit: GraphQLRateLimit = { remaining: 5000, cost: 1, resetAt: 0 };
    let requestCount = 0;
    let latestPrUpdatedAt: string | null = null;

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
          if (!latestPrUpdatedAt || pr.updatedAt > latestPrUpdatedAt) {
            latestPrUpdatedAt = pr.updatedAt;
          }

          // Only upsert PRs authored by the user
          if (isPRAuthoredByUser(pr.author?.login)) {
            await this.upsertPR(db, repo.id, {
              githubId: pr.databaseId!,
              number: pr.number,
              title: pr.title,
              body: pr.body ?? null,
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
              body: review.body ?? null,
              submittedAt: review.submittedAt,
            });
          }
        }

        if (reachedOldData) break;

        cursor = data.repository?.pullRequests.pageInfo.hasNextPage ? (data.repository.pullRequests.pageInfo.endCursor ?? null) : null;
      } while (cursor);

      // Update repo with latest PR update time
      if (latestPrUpdatedAt) {
        await db.update(repos).set({ lastPrUpdatedAt: latestPrUpdatedAt }).where(eq(repos.id, repo.id));
      }
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
    const validStates = ['APPROVED', 'CHANGES_REQUESTED', 'COMMENTED'] as const;
    if (!validStates.includes(review.state as (typeof validStates)[number])) return;

    await db
      .insert(prReviews)
      .values({
        githubId: review.githubId,
        repoId,
        prNumber,
        prTitle,
        state: review.state as 'APPROVED' | 'CHANGES_REQUESTED' | 'COMMENTED',
        body: review.body,
        submittedAt: review.submittedAt,
      })
      .onConflictDoNothing();
  }

  private async finalizeSyncState(db: DB, repoList: Repo[]): Promise<void> {
    // Clear cursors after successful sync
    for (const repo of repoList) {
      await db
        .update(repos)
        .set({
          commitsCursor: null,
          prsCursor: null,
        })
        .where(eq(repos.id, repo.id));
    }
  }

  private async checkRateLimitAndSleep(step: WorkflowStep, rateLimit: GraphQLRateLimit, stepName: string): Promise<void> {
    const threshold = calculateDynamicThreshold(this.metrics, this.totalRepos, this.processedRepos);

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
    }> = {
      phase,
      progressPct: progress,
    };

    if (currentRepo !== undefined) {
      updates.currentRepo = currentRepo;
    }
    if (total !== undefined) {
      updates.reposTotal = total;
    }
    if (processed !== undefined) {
      updates.reposProcessed = processed;
    }
    if (phase === 'completed') {
      updates.lastCompletedAt = sql`datetime('now')`;
    }

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
    const languages = await db
      .select({
        language: repos.language,
        commit_count: count(commits.id),
        lines_changed: sum(sql`${commits.additions} + ${commits.deletions}`),
      })
      .from(commits)
      .innerJoin(repos, eq(commits.repoId, repos.id))
      .where(sql`${repos.language} IS NOT NULL`)
      .groupBy(repos.language)
      .orderBy(sql`lines_changed DESC`)
      .limit(20)
      .all();

    // Get recent activity summary (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentActivity = await db
      .select({
        language: repos.language,
        commits: count(commits.id),
        privacy_class: repos.privacyClass,
      })
      .from(commits)
      .innerJoin(repos, eq(commits.repoId, repos.id))
      .where(sql`${commits.authorDate} > ${sixMonthsAgo.toISOString()}`)
      .groupBy(repos.language, repos.privacyClass)
      .orderBy(sql`commits DESC`)
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

    // Parse AI response
    const text = typeof response === 'string' ? response : ((response as { response?: string }).response ?? '');

    // Extract JSON from response (AI might include markdown)
    const jsonMatch = /\[[\s\S]*\]/.exec(text);
    if (!jsonMatch) {
      return [];
    }

    const skills: AISkill[] = JSON.parse(jsonMatch[0]);

    // Mark all as AI-discovered, add placeholders for Japanese
    return skills.map(s => ({
      ...s,
      description_ja: '',
      last_active: new Date().toISOString(),
      is_ai_discovered: true,
    }));
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

        const text = typeof response === 'string' ? response : ((response as { response?: string }).response ?? '');
        skill.description_ja = text.trim();
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

      const profileText = typeof profileResponse === 'string' ? profileResponse : ((profileResponse as { response?: string }).response ?? '');
      const jsonMatch = /\{[\s\S]*\}/.exec(profileText);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        profile = {
          ...parsed,
          generated_at: new Date().toISOString(),
          model_used: '@cf/google/gemma-3-12b-it',
        };
      } else {
        throw new Error('No JSON found');
      }
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
    await this.env.CACHE.put('ai_skills_state', JSON.stringify(state), {
      expirationTtl: 60 * 60 * 24,
    });
  }
}
