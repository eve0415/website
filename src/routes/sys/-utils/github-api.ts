import { createServerFn } from "@tanstack/react-start";
import { Octokit } from "@octokit/core";
import { throttling } from "@octokit/plugin-throttling";
import { retry } from "@octokit/plugin-retry";
import { env } from "cloudflare:workers";

import type {
  ContributionLevel,
  GetGitHubStatsQuery,
  GetGitHubStatsQueryVariables,
} from "#generated/github-graphql";

// Cache key for KV storage
const CACHE_KEY = "github_stats_eve0415";

// GitHub username
const GITHUB_USERNAME = "eve0415";

// Create Octokit with plugins
const MyOctokit = Octokit.plugin(throttling, retry);

// Types for GitHub stats
export interface GitHubStats {
  user: {
    login: string;
    publicRepos: number;
    privateRepos: number;
    totalRepos: number;
    followers: number;
    following: number;
  };
  contributions: {
    totalCommits: number;
    totalPRs: number;
    totalIssues: number;
    currentStreak: number;
    longestStreak: number;
    contributionCalendar: ContributionDay[];
  };
  languages: LanguageStat[];
  cachedAt: string;
}

export interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface LanguageStat {
  name: string;
  percentage: number;
  color: string;
}

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
  cachedAt: "未取得",
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
  const kv = env.GITHUB_STATS_CACHE;
  const cached = await kv.get<GitHubStats>(CACHE_KEY, "json");
  return cached ?? FALLBACK_STATS;
});

// Cron handler: Fetch from GitHub and store in KV
export async function refreshGitHubStats(workerEnv: Env): Promise<void> {
  const pat = workerEnv.GITHUB_PAT;
  const kv = workerEnv.GITHUB_STATS_CACHE;

  // Create Octokit instance with plugins
  const octokit = new MyOctokit({
    auth: pat,
    throttle: {
      onRateLimit: (
        retryAfter: number,
        options: { method: string; url: string },
        _octokit: Octokit,
        retryCount: number,
      ) => {
        console.warn(
          `Rate limit hit for ${options.method} ${options.url}. Retry ${retryCount + 1} after ${retryAfter}s`,
        );
        return retryCount < 3;
      },
      onSecondaryRateLimit: (retryAfter: number, options: { method: string; url: string }) => {
        console.warn(
          `Secondary rate limit hit for ${options.method} ${options.url}. Waiting ${retryAfter}s`,
        );
        return true;
      },
    },
    retry: {
      doNotRetry: ["429"],
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
    const response: GetGitHubStatsQuery = await octokit.graphql<GetGitHubStatsQuery>(
      GET_GITHUB_STATS_QUERY,
      { cursor } satisfies GetGitHubStatsQueryVariables,
    );

    if (!graphqlData) {
      graphqlData = response;
    }

    const repos = response.viewer.repositories.nodes ?? [];
    for (const repo of repos) {
      if (repo) {
        allRepos.push(repo);
      }
    }

    cursor = response.viewer.repositories.pageInfo.hasNextPage
      ? (response.viewer.repositories.pageInfo.endCursor ?? null)
      : null;
  } while (cursor);

  if (!graphqlData) {
    throw new Error("Failed to fetch GitHub stats");
  }

  // Fetch language data for non-fork repos via REST (parallel)
  const nonForkRepos = allRepos.filter((repo) => !repo.isFork);
  const languagePromises = nonForkRepos.map((repo) =>
    octokit
      .request("GET /repos/{owner}/{repo}/languages", {
        owner: GITHUB_USERNAME,
        repo: repo.name,
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
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
  const contributionDays =
    graphqlData.viewer.contributionsCollection.contributionCalendar.weeks.flatMap((week) =>
      week.contributionDays.map((day) => ({
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
      totalRepos:
        graphqlData.viewer.publicRepos.totalCount + graphqlData.viewer.privateRepos.totalCount,
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

function levelFromContributionLevel(level: ContributionLevel): 0 | 1 | 2 | 3 | 4 {
  switch (level) {
    case "NONE":
      return 0;
    case "FIRST_QUARTILE":
      return 1;
    case "SECOND_QUARTILE":
      return 2;
    case "THIRD_QUARTILE":
      return 3;
    case "FOURTH_QUARTILE":
      return 4;
    default:
      return 0;
  }
}

function calculateStreaksJST(days: Array<{ date: string; count: number }>): {
  currentStreak: number;
  longestStreak: number;
} {
  if (days.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Get today's date in JST (UTC+9)
  const now = new Date();
  const jstOffset = 9 * 60 * 60 * 1000;
  const nowJST = new Date(now.getTime() + jstOffset);
  const todayJST = nowJST.toISOString().split("T")[0] ?? "";
  const yesterdayJST =
    new Date(nowJST.getTime() - 24 * 60 * 60 * 1000).toISOString().split("T")[0] ?? "";

  // Sort by date ascending
  const sortedDays = [...days].sort((a, b) => a.date.localeCompare(b.date));

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 0;
  let prevDate: string | null = null;

  for (const day of sortedDays) {
    if (day.count > 0) {
      if (prevDate === null) {
        tempStreak = 1;
      } else {
        // Check if this day is consecutive to previous
        const prev = new Date(prevDate);
        const curr = new Date(day.date);
        const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);
      prevDate = day.date;
    } else {
      tempStreak = 0;
      prevDate = null;
    }
  }

  // Calculate current streak (from today or yesterday backwards)
  let currentStreak = 0;
  const sortedDesc = [...days].sort((a, b) => b.date.localeCompare(a.date));

  // Find the starting point for current streak
  let streakStarted = false;
  let expectedDate = todayJST;

  for (const day of sortedDesc) {
    if (!streakStarted) {
      // Looking for today or yesterday to start the streak
      if (day.date === todayJST || day.date === yesterdayJST) {
        if (day.count > 0) {
          streakStarted = true;
          currentStreak = 1;
          expectedDate = day.date;
        } else if (day.date === todayJST) {
          // Today has no contributions, check yesterday
          continue;
        } else {
          // Yesterday has no contributions, no current streak
          break;
        }
      } else if (day.date < yesterdayJST) {
        // Past yesterday with no contributions found, no current streak
        break;
      }
    } else {
      // Continue checking streak backwards
      const expected = new Date(expectedDate);
      expected.setDate(expected.getDate() - 1);
      const expectedStr = expected.toISOString().split("T")[0] ?? "";

      if (day.date === expectedStr) {
        if (day.count > 0) {
          currentStreak++;
          expectedDate = day.date;
        } else {
          break;
        }
      } else if (day.date < expectedStr) {
        // Skipped a day, streak ends
        break;
      }
    }
  }

  return { currentStreak, longestStreak };
}

function getLanguageColor(language: string): string {
  const colors: Record<string, string> = {
    TypeScript: "#3178c6",
    JavaScript: "#f1e05a",
    Python: "#3572A5",
    Rust: "#dea584",
    Go: "#00ADD8",
    Java: "#b07219",
    "C++": "#f34b7d",
    C: "#555555",
    Ruby: "#701516",
    PHP: "#4F5D95",
    Swift: "#F05138",
    Kotlin: "#A97BFF",
    Dart: "#00B4AB",
    Shell: "#89e051",
    HTML: "#e34c26",
    CSS: "#563d7c",
    Vue: "#41b883",
    Svelte: "#ff3e00",
    SCSS: "#c6538c",
    Lua: "#000080",
    Zig: "#ec915c",
    Nix: "#7e7eff",
  };

  return colors[language] ?? "#8b949e";
}

// Get relative time string in Japanese
export function getRelativeTimeJapanese(isoDate: string): string {
  if (isoDate === "未取得") {
    return isoDate;
  }

  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return "たった今";
  if (diffMinutes < 60) return `${diffMinutes}分前`;
  if (diffHours < 24) return `${diffHours}時間前`;
  if (diffDays < 7) return `${diffDays}日前`;

  return date.toLocaleDateString("ja-JP");
}
