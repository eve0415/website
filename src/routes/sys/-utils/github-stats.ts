import type { GetGitHubStatsQuery, GetGitHubStatsQueryVariables } from '#generated/github-graphql';

import { Octokit } from '@octokit/core';
import { retry } from '@octokit/plugin-retry';
import { throttling } from '@octokit/plugin-throttling';
import { createServerFn } from '@tanstack/react-start';
import { env } from 'cloudflare:workers';

import { type GitHubStats, type LanguageStat, calculateStreaksJST, getLanguageColor, levelFromContributionLevel } from './github-stats-utils';

// Cache key for KV storage
const CACHE_KEY = 'github_stats_eve0415';

// GitHub username
const GITHUB_USERNAME = 'eve0415';

// Create Octokit with plugins
const MyOctokit = Octokit.plugin(throttling, retry);

// Static fallback data when KV is empty
const FALLBACK_STATS: GitHubStats = {
  user: {
    login: GITHUB_USERNAME,
    publicRepos: 0,
    privateRepos: 0,
    totalRepos: 0,
    followers: 0,
    following: 0,
  },
  contributions: {
    totalCommits: 0,
    totalPRs: 0,
    totalIssues: 0,
    currentStreak: 0,
    longestStreak: 0,
    contributionCalendar: [],
  },
  languages: [],
  cachedAt: '未取得',
};

// GraphQL query string
const GET_GITHUB_STATS_QUERY = /* GraphQL */ `
  query GetGitHubStats($cursor: String) {
    viewer {
      login
      publicRepos: repositories(privacy: PUBLIC) {
        totalCount
      }
      privateRepos: repositories(privacy: PRIVATE) {
        totalCount
      }
      followers {
        totalCount
      }
      following {
        totalCount
      }
      repositories(
        first: 100
        ownerAffiliations: OWNER
        orderBy: { field: PUSHED_AT, direction: DESC }
        after: $cursor
      ) {
        totalCount
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          name
          isFork
          diskUsage
        }
      }
      contributionsCollection {
        totalCommitContributions
        totalPullRequestContributions
        totalIssueContributions
        contributionCalendar {
          weeks {
            contributionDays {
              date
              contributionCount
              contributionLevel
            }
          }
        }
      }
    }
  }
`;

// Route handler: Read-only from KV
export const getGitHubStats = createServerFn().handler(async (): Promise<GitHubStats> => {
  const kv = env.CACHE;
  const cached = await kv.get<GitHubStats>(CACHE_KEY, 'json');
  return cached ?? FALLBACK_STATS;
});

// Cron handler: Fetch from GitHub and store in KV
export async function refreshGitHubStats(workerEnv: Env): Promise<void> {
  const pat = workerEnv.GITHUB_PAT;
  const kv = workerEnv.CACHE;

  // Create Octokit instance with plugins
  const octokit = new MyOctokit({
    auth: pat,
    throttle: {
      onRateLimit: (retryAfter: number, options: { method: string; url: string }, _octokit: Octokit, retryCount: number) => {
        console.warn(`Rate limit hit for ${options.method} ${options.url}. Retry ${retryCount + 1} after ${retryAfter}s`);
        return retryCount < 3;
      },
      onSecondaryRateLimit: (retryAfter: number, options: { method: string; url: string }) => {
        console.warn(`Secondary rate limit hit for ${options.method} ${options.url}. Waiting ${retryAfter}s`);
        return true;
      },
    },
    retry: {
      doNotRetry: ['429'],
    },
  });

  // Fetch all data from GitHub
  const stats = await fetchAllStats(octokit);

  // Store in KV
  await kv.put(CACHE_KEY, JSON.stringify(stats));
}

async function fetchAllStats(octokit: InstanceType<typeof MyOctokit>): Promise<GitHubStats> {
  // Fetch GraphQL data with pagination for repos
  const allRepos: Array<{ name: string; isFork: boolean; diskUsage?: number | null }> = [];
  let cursor: string | null = null;
  let graphqlData: GetGitHubStatsQuery | null = null;

  do {
    const response: GetGitHubStatsQuery = await octokit.graphql<GetGitHubStatsQuery>(GET_GITHUB_STATS_QUERY, { cursor } satisfies GetGitHubStatsQueryVariables);

    if (!graphqlData) {
      graphqlData = response;
    }

    const repos = response.viewer.repositories.nodes ?? [];
    for (const repo of repos) {
      if (repo) {
        allRepos.push(repo);
      }
    }

    cursor = response.viewer.repositories.pageInfo.hasNextPage ? (response.viewer.repositories.pageInfo.endCursor ?? null) : null;
  } while (cursor);

  if (!graphqlData) {
    throw new Error('Failed to fetch GitHub stats');
  }

  // Fetch language data for non-fork repos via REST (parallel)
  const nonForkRepos = allRepos.filter(repo => !repo.isFork);
  const languagePromises = nonForkRepos.map(repo =>
    octokit
      .request('GET /repos/{owner}/{repo}/languages', {
        owner: GITHUB_USERNAME,
        repo: repo.name,
      })
      .catch(() => ({ data: {} })),
  );
  const languageResponses = await Promise.all(languagePromises);

  // Aggregate language bytes
  const languageBytes: Record<string, number> = {};
  for (const response of languageResponses) {
    const languages = response.data as Record<string, number>;
    for (const [lang, bytes] of Object.entries(languages)) {
      languageBytes[lang] = (languageBytes[lang] ?? 0) + bytes;
    }
  }

  // Calculate language percentages
  const totalBytes = Object.values(languageBytes).reduce((a, b) => a + b, 0);
  const languages: LanguageStat[] =
    totalBytes > 0
      ? Object.entries(languageBytes)
          .map(([name, bytes]) => ({
            name,
            percentage: (bytes / totalBytes) * 100,
            color: getLanguageColor(name),
          }))
          .sort((a, b) => b.percentage - a.percentage)
          .slice(0, 6)
      : [];

  // Process contribution calendar
  const contributionDays = graphqlData.viewer.contributionsCollection.contributionCalendar.weeks.flatMap(week =>
    week.contributionDays.map(day => ({
      date: day.date,
      count: day.contributionCount,
      level: levelFromContributionLevel(day.contributionLevel),
    })),
  );

  // Calculate streaks using JST
  const { currentStreak, longestStreak } = calculateStreaksJST(contributionDays);

  return {
    user: {
      login: graphqlData.viewer.login,
      publicRepos: graphqlData.viewer.publicRepos.totalCount,
      privateRepos: graphqlData.viewer.privateRepos.totalCount,
      totalRepos: graphqlData.viewer.publicRepos.totalCount + graphqlData.viewer.privateRepos.totalCount,
      followers: graphqlData.viewer.followers.totalCount,
      following: graphqlData.viewer.following.totalCount,
    },
    contributions: {
      totalCommits: graphqlData.viewer.contributionsCollection.totalCommitContributions,
      totalPRs: graphqlData.viewer.contributionsCollection.totalPullRequestContributions,
      totalIssues: graphqlData.viewer.contributionsCollection.totalIssueContributions,
      currentStreak,
      longestStreak,
      contributionCalendar: contributionDays,
    },
    languages,
    cachedAt: new Date().toISOString(),
  };
}
