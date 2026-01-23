// Cloudflare Workflow for AI Skills Analysis
// Runs as durable execution - can take days/weeks with sleep() for rate limits

import type { DB } from '#db';
import type { Repo } from '#db/types';
import type {
  AIProfileSummary,
  AISkill,
  AISkillsContent,
  GitHubCommit,
  GitHubPR,
  GitHubRepo,
  GitHubReview,
  RateLimitInfo,
  WorkflowPhase,
} from '../routes/skills/-utils/ai-skills-types';

import { WorkflowEntrypoint, type WorkflowEvent, type WorkflowStep } from 'cloudflare:workers';
import { count, eq, inArray, sql, sum } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';

import * as schema from '#db/schema';
import { commits, historySummaries, prReviews, pullRequests, repos, workflowState } from '#db/schema';

import { classifyRepo, sanitizeForAI } from '../routes/skills/-utils/privacy-filter';

const GITHUB_USERNAME = 'eve0415';
const GITHUB_API = 'https://api.github.com';
const RATE_LIMIT_THRESHOLD = 100; // Sleep when remaining < this

interface WorkflowEnv {
  GITHUB_PAT: string;
  SKILLS_DB: D1Database;
  CACHE: KVNamespace;
  AI: Ai;
}

export class SkillsAnalysisWorkflow extends WorkflowEntrypoint<WorkflowEnv, void> {
  override async run(_event: WorkflowEvent<void>, step: WorkflowStep) {
    // Step 1: List all repositories
    const repoList = await step.do('list-repos', async () => {
      const db = drizzle(this.env.SKILLS_DB, { schema, casing: 'snake_case' });
      await this.updateState(db, 'listing-repos', 0);
      return await this.fetchAllRepos(this.env, db);
    });

    // Step 2: Fetch commits for each repo
    for (let i = 0; i < repoList.length; i++) {
      const repo = repoList[i];
      if (!repo) continue;

      const rateLimit = await step.do(`commits-${repo.githubId}`, async () => {
        const db = drizzle(this.env.SKILLS_DB, { schema, casing: 'snake_case' });
        await this.updateState(db, 'fetching-commits', Math.floor((i / repoList.length) * 30), repo.fullName, repoList.length, i);
        return await this.fetchAndStoreCommits(this.env, db, repo);
      });

      await this.dynamicSleep(step, rateLimit, `commits-sleep-${repo.githubId}`);
    }

    // Step 3: Fetch PRs for each repo
    for (let i = 0; i < repoList.length; i++) {
      const repo = repoList[i];
      if (!repo) continue;

      const rateLimit = await step.do(`prs-${repo.githubId}`, async () => {
        const db = drizzle(this.env.SKILLS_DB, { schema, casing: 'snake_case' });
        await this.updateState(db, 'fetching-prs', 30 + Math.floor((i / repoList.length) * 15), repo.fullName);
        return await this.fetchAndStorePRs(this.env, db, repo);
      });

      await this.dynamicSleep(step, rateLimit, `prs-sleep-${repo.githubId}`);
    }

    // Step 4: Fetch PR reviews
    const reviewRateLimit = await step.do('reviews', async () => {
      const db = drizzle(this.env.SKILLS_DB, { schema, casing: 'snake_case' });
      await this.updateState(db, 'fetching-reviews', 45);
      return await this.fetchAndStoreReviews(this.env, db);
    });
    await this.dynamicSleep(step, reviewRateLimit, 'reviews-sleep');

    // Step 5: Squash history for AI context
    const summary = await step.do('squash-history', async () => {
      const db = drizzle(this.env.SKILLS_DB, { schema, casing: 'snake_case' });
      await this.updateState(db, 'squashing-history', 60);
      return await this.squashHistory(db);
    });

    // Step 6: AI skill extraction
    const skills = await step.do('ai-extract-skills', async () => {
      const db = drizzle(this.env.SKILLS_DB, { schema, casing: 'snake_case' });
      await this.updateState(db, 'ai-extracting-skills', 70);
      return await this.extractSkillsWithAI(this.env, summary);
    });

    // Step 7: AI Japanese generation
    const content = await step.do('ai-generate-japanese', async () => {
      const db = drizzle(this.env.SKILLS_DB, { schema, casing: 'snake_case' });
      await this.updateState(db, 'ai-generating-japanese', 85);
      return await this.generateJapaneseDescriptions(this.env, db, skills, summary);
    });

    // Step 8: Store final results
    await step.do('store-results', async () => {
      const db = drizzle(this.env.SKILLS_DB, { schema, casing: 'snake_case' });
      await this.updateState(db, 'storing-results', 95);
      await this.storeResults(this.env, db, content);
      await this.updateState(db, 'completed', 100);
    });
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

  private async dynamicSleep(step: WorkflowStep, rateLimit: RateLimitInfo, name: string) {
    if (rateLimit.remaining < RATE_LIMIT_THRESHOLD) {
      const sleepMs = Math.max(0, rateLimit.resetAt * 1000 - Date.now() + 1000);
      if (sleepMs > 0) {
        await step.sleep(name, `${Math.ceil(sleepMs / 1000)} seconds`);
      }
    }
  }

  private extractRateLimit(headers: Headers): RateLimitInfo {
    return {
      remaining: parseInt(headers.get('X-RateLimit-Remaining') || '5000', 10),
      limit: parseInt(headers.get('X-RateLimit-Limit') || '5000', 10),
      resetAt: parseInt(headers.get('X-RateLimit-Reset') || '0', 10),
    };
  }

  private async fetchAllRepos(env: WorkflowEnv, db: DB): Promise<Repo[]> {
    const repoList: Repo[] = [];
    let page = 1;

    while (true) {
      // Fetch user's own repos
      const userReposRes = await fetch(`${GITHUB_API}/users/${GITHUB_USERNAME}/repos?per_page=100&page=${page}`, {
        headers: {
          Authorization: `Bearer ${env.GITHUB_PAT}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      });

      const userRepos: GitHubRepo[] = await userReposRes.json();
      if (userRepos.length === 0) break;

      for (const repo of userRepos) {
        const record = await this.upsertRepo(db, repo);
        repoList.push(record);
      }

      page++;
    }

    // Fetch repos from orgs where user is member
    const orgsRes = await fetch(`${GITHUB_API}/user/orgs`, {
      headers: {
        Authorization: `Bearer ${env.GITHUB_PAT}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    const orgs: Array<{ login: string }> = await orgsRes.json();

    for (const org of orgs) {
      page = 1;
      while (true) {
        const orgReposRes = await fetch(`${GITHUB_API}/orgs/${org.login}/repos?per_page=100&page=${page}`, {
          headers: {
            Authorization: `Bearer ${env.GITHUB_PAT}`,
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
          },
        });

        const orgRepos: GitHubRepo[] = await orgReposRes.json();
        if (orgRepos.length === 0) break;

        for (const repo of orgRepos) {
          const record = await this.upsertRepo(db, repo);
          repoList.push(record);
        }

        page++;
      }
    }

    return repoList;
  }

  private async upsertRepo(db: DB, repo: GitHubRepo): Promise<Repo> {
    const privacyClass = classifyRepo(repo);

    await db
      .insert(repos)
      .values({
        githubId: repo.id,
        fullName: repo.full_name,
        name: repo.name,
        owner: repo.owner.login,
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

  private async fetchAndStoreCommits(env: WorkflowEnv, db: DB, repo: Repo): Promise<RateLimitInfo> {
    let page = 1;
    let lastRateLimit: RateLimitInfo = { remaining: 5000, limit: 5000, resetAt: 0 };

    while (true) {
      const res = await fetch(`${GITHUB_API}/repos/${repo.fullName}/commits?author=${GITHUB_USERNAME}&per_page=100&page=${page}`, {
        headers: {
          Authorization: `Bearer ${env.GITHUB_PAT}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      });

      lastRateLimit = this.extractRateLimit(res.headers);

      if (!res.ok) break;

      const commitList: GitHubCommit[] = await res.json();
      if (commitList.length === 0) break;

      for (const commit of commitList) {
        await this.upsertCommit(db, repo.id, commit);
      }

      page++;
    }

    return lastRateLimit;
  }

  private async upsertCommit(db: DB, repoId: number, commit: GitHubCommit) {
    await db
      .insert(commits)
      .values({
        sha: commit.sha,
        repoId,
        message: commit.commit.message,
        authorDate: commit.commit.author.date,
        additions: commit.stats?.additions || 0,
        deletions: commit.stats?.deletions || 0,
        filesChanged: commit.files?.length || 0,
      })
      .onConflictDoNothing();
  }

  private async fetchAndStorePRs(env: WorkflowEnv, db: DB, repo: Repo): Promise<RateLimitInfo> {
    let page = 1;
    let lastRateLimit: RateLimitInfo = { remaining: 5000, limit: 5000, resetAt: 0 };

    while (true) {
      const res = await fetch(`${GITHUB_API}/repos/${repo.fullName}/pulls?state=all&per_page=100&page=${page}`, {
        headers: {
          Authorization: `Bearer ${env.GITHUB_PAT}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      });

      lastRateLimit = this.extractRateLimit(res.headers);

      if (!res.ok) break;

      const prs: Array<GitHubPR & { user: { login: string } }> = await res.json();
      if (prs.length === 0) break;

      // Filter to only PRs authored by eve0415
      const myPRs = prs.filter(pr => pr.user.login.toLowerCase() === GITHUB_USERNAME.toLowerCase());

      for (const pr of myPRs) {
        await this.upsertPR(db, repo.id, pr);
      }

      page++;
    }

    return lastRateLimit;
  }

  private async upsertPR(db: DB, repoId: number, pr: GitHubPR) {
    await db
      .insert(pullRequests)
      .values({
        githubId: pr.id,
        repoId,
        number: pr.number,
        title: pr.title,
        body: pr.body,
        state: pr.state,
        merged: pr.merged,
        additions: pr.additions,
        deletions: pr.deletions,
        changedFiles: pr.changed_files,
        commitsCount: pr.commits,
        commentsCount: pr.comments,
        reviewCommentsCount: pr.review_comments,
        createdAt: pr.created_at,
        mergedAt: pr.merged_at,
        closedAt: pr.closed_at,
      })
      .onConflictDoUpdate({
        target: pullRequests.githubId,
        set: {
          state: pr.state,
          merged: pr.merged,
          mergedAt: pr.merged_at,
          closedAt: pr.closed_at,
          fetchedAt: sql`datetime('now')`,
        },
      });
  }

  private async fetchAndStoreReviews(env: WorkflowEnv, db: DB): Promise<RateLimitInfo> {
    // Use search API to find all reviews by user
    let page = 1;
    let lastRateLimit: RateLimitInfo = { remaining: 5000, limit: 5000, resetAt: 0 };

    while (true) {
      const res = await fetch(`${GITHUB_API}/search/issues?q=reviewed-by:${GITHUB_USERNAME}+is:pr&per_page=100&page=${page}`, {
        headers: {
          Authorization: `Bearer ${env.GITHUB_PAT}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      });

      lastRateLimit = this.extractRateLimit(res.headers);

      if (!res.ok) break;

      const data: { items: Array<{ number: number; title: string; repository_url: string }> } = await res.json();
      if (data.items.length === 0) break;

      for (const item of data.items) {
        // Extract repo info from repository_url
        const repoMatch = /repos\/(.+)$/.exec(item.repository_url);
        if (!repoMatch?.[1]) continue;

        const repoFullName = repoMatch[1];

        // Fetch actual reviews for this PR
        const reviewsRes = await fetch(`${GITHUB_API}/repos/${repoFullName}/pulls/${item.number}/reviews`, {
          headers: {
            Authorization: `Bearer ${env.GITHUB_PAT}`,
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
          },
        });

        if (!reviewsRes.ok) continue;

        const reviews: Array<GitHubReview & { user: { login: string } }> = await reviewsRes.json();
        const myReviews = reviews.filter(r => r.user.login.toLowerCase() === GITHUB_USERNAME.toLowerCase() && r.state !== 'PENDING');

        // Find repo in DB
        const repo = await db.select({ id: repos.id }).from(repos).where(eq(repos.fullName, repoFullName)).get();

        if (!repo) continue;

        for (const review of myReviews) {
          await this.upsertReview(db, repo.id, item.number, item.title, review);
        }
      }

      page++;
    }

    return lastRateLimit;
  }

  private async upsertReview(db: DB, repoId: number, prNumber: number, prTitle: string, review: GitHubReview) {
    // Filter valid states for the enum
    const validStates = ['APPROVED', 'CHANGES_REQUESTED', 'COMMENTED'] as const;
    if (!validStates.includes(review.state as (typeof validStates)[number])) return;

    await db
      .insert(prReviews)
      .values({
        githubId: review.id,
        repoId,
        prNumber,
        prTitle,
        state: review.state as 'APPROVED' | 'CHANGES_REQUESTED' | 'COMMENTED',
        body: review.body,
        submittedAt: review.submitted_at,
      })
      .onConflictDoNothing();
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
      total_commits: commitCount?.count || 0,
      total_prs: prCount?.count || 0,
      total_reviews: reviewCount?.count || 0,
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

    const privateNames = privateRepos.map(r => r.fullName);

    let summary = `# GitHub Activity Summary for ${GITHUB_USERNAME}

## Overview
- Total commits analyzed: ${stats.total_commits}
- Total PRs authored: ${stats.total_prs}
- Total PR reviews given: ${stats.total_reviews}
- Repositories with commits: ${stats.repos_with_commits}

## Language Distribution (by lines changed)
${languages.map(l => `- ${l.language}: ${l.commit_count} commits, ${l.lines_changed} lines`).join('\n')}

## Recent Activity (Last 6 Months)
${recentActivity.map(a => `- ${a.language || 'Unknown'}: ${a.commits} commits (${a.privacy_class})`).join('\n')}

## PR Patterns
${prPatterns.map(p => `- ${p.state}${p.merged ? ' (merged)' : ''}: ${p.count} PRs, avg ${Math.round(p.avg_changes)} lines`).join('\n')}

## Review Patterns
${reviewPatterns.map(r => `- ${r.state}: ${r.count} reviews`).join('\n')}
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
        tokenEstimate: Math.ceil(summary.length / 4), // Rough token estimate
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

  private async extractSkillsWithAI(env: WorkflowEnv, summary: string): Promise<AISkill[]> {
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

    const response = await env.AI.run('@cf/qwen/qwen3-30b-a3b-fp8', {
      prompt,
      max_tokens: 4096,
    });

    // Parse AI response
    const text = typeof response === 'string' ? response : (response as { response?: string }).response || '';

    // Extract JSON from response (AI might include markdown)
    const jsonMatch = /\[[\s\S]*\]/.exec(text);
    if (!jsonMatch) {
      return [];
    }

    const skills: AISkill[] = JSON.parse(jsonMatch[0]);

    // Mark all as AI-discovered, add placeholders for Japanese
    return skills.map(s => ({
      ...s,
      description_ja: '', // Will be filled in next step
      last_active: new Date().toISOString(),
      is_ai_discovered: true,
    }));
  }

  private async generateJapaneseDescriptions(env: WorkflowEnv, db: DB, skills: AISkill[], summary: string): Promise<AISkillsContent> {
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

      const response = await env.AI.run('@cf/google/gemma-3-12b-it', {
        prompt,
        max_tokens: 512,
      });

      const text = typeof response === 'string' ? response : (response as { response?: string }).response || '';
      skill.description_ja = text.trim();
    }

    // Generate profile summary
    const profilePrompt = `あなたはプロフェッショナルなテクニカルライターです。以下の開発者のGitHub活動サマリーを元に、日本語でプロフィールを書いてください。

${summary}

以下の3つを出力してください（JSONフォーマット）:
1. summary_ja: 全体的なプロフィール（3-4文）
2. activity_narrative_ja: 最近の活動について（1-2文、「最近は〜に注力している」のような形式）
3. skill_comparison_ja: スキルの比較（1文、「〜が最も強く、〜が成長中」のような形式）

JSONのみ出力してください。`;

    const profileResponse = await env.AI.run('@cf/google/gemma-3-12b-it', {
      prompt: profilePrompt,
      max_tokens: 1024,
    });

    const profileText = typeof profileResponse === 'string' ? profileResponse : (profileResponse as { response?: string }).response || '';

    let profile: AIProfileSummary;
    try {
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
      total_commits_analyzed: commitCount?.count || 0,
      total_prs_analyzed: prCount?.count || 0,
      total_reviews_analyzed: reviewCount?.count || 0,
    };

    // Store profile to KV
    await env.CACHE.put('ai_profile_summary_ja', JSON.stringify(profile), {
      expirationTtl: 60 * 60 * 24 * 30, // 30 days
    });

    return content;
  }

  private async storeResults(env: WorkflowEnv, db: DB, content: AISkillsContent) {
    await env.CACHE.put('ai_skills_content_ja', JSON.stringify(content), {
      expirationTtl: 60 * 60 * 24 * 30, // 30 days
    });

    // Also store workflow state snapshot
    const state = await db.select().from(workflowState).where(eq(workflowState.id, 1)).get();
    await env.CACHE.put('ai_skills_state', JSON.stringify(state), {
      expirationTtl: 60 * 60 * 24, // 1 day
    });
  }
}
