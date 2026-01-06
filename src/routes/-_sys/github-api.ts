import { createServerFn } from "@tanstack/react-start";
import { env } from "cloudflare:workers";

// Cache TTL: 1 hour
const CACHE_TTL_SECONDS = 60 * 60;
const CACHE_KEY = "github_stats_eve0415";

// GitHub username
const GITHUB_USERNAME = "eve0415";

// Types for GitHub API responses
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

interface GitHubUserResponse {
  login: string;
  public_repos: number;
  followers: number;
  following: number;
  owned_private_repos?: number;
  total_private_repos?: number;
}

interface GitHubRepoResponse {
  language: string | null;
  fork: boolean;
  size: number;
}

interface GitHubGraphQLResponse {
  data: {
    user: {
      contributionsCollection: {
        totalCommitContributions: number;
        totalPullRequestContributions: number;
        totalIssueContributions: number;
        contributionCalendar: {
          totalContributions: number;
          weeks: Array<{
            contributionDays: Array<{
              date: string;
              contributionCount: number;
              contributionLevel: string;
            }>;
          }>;
        };
      };
    };
  };
}

// Server function to fetch GitHub stats
export const fetchGitHubStats = createServerFn().handler(async (): Promise<GitHubStats> => {
  const kv = env.GITHUB_STATS_CACHE;
  const pat = env.GITHUB_PAT;

  // Check cache first
  const cached = await kv.get<GitHubStats>(CACHE_KEY, "json");
  if (cached) {
    return cached;
  }

  // Fetch fresh data
  const stats = await fetchStats(pat);

  // Cache the result
  await kv.put(CACHE_KEY, JSON.stringify(stats), {
    expirationTtl: CACHE_TTL_SECONDS,
  });

  return stats;
});

async function fetchStats(pat: string): Promise<GitHubStats> {
  const headers = {
    Authorization: `Bearer ${pat}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "eve0415-website",
  };

  // Fetch user data (includes private repo count when authenticated)
  const userResponse = await fetch("https://api.github.com/user", { headers });
  if (!userResponse.ok) {
    throw new Error(`GitHub API error: ${userResponse.status}`);
  }
  const userData = (await userResponse.json()) as GitHubUserResponse;

  // Fetch repos for language stats (paginated)
  const repos = await fetchAllRepos(headers);

  // Fetch contribution data via GraphQL
  const contributions = await fetchContributions(pat);

  // Calculate language stats
  const languages = calculateLanguageStats(repos);

  // Calculate streaks from contribution calendar
  const { currentStreak, longestStreak } = calculateStreaks(
    contributions.contributionCalendar.weeks.flatMap((w) =>
      w.contributionDays.map((d) => ({
        date: d.date,
        count: d.contributionCount,
      })),
    ),
  );

  const stats: GitHubStats = {
    user: {
      login: userData.login,
      publicRepos: userData.public_repos,
      privateRepos: userData.total_private_repos ?? userData.owned_private_repos ?? 0,
      totalRepos:
        userData.public_repos + (userData.total_private_repos ?? userData.owned_private_repos ?? 0),
      followers: userData.followers,
      following: userData.following,
    },
    contributions: {
      totalCommits: contributions.totalCommitContributions,
      totalPRs: contributions.totalPullRequestContributions,
      totalIssues: contributions.totalIssueContributions,
      currentStreak,
      longestStreak,
      contributionCalendar: contributions.contributionCalendar.weeks.flatMap((w) =>
        w.contributionDays.map((d) => ({
          date: d.date,
          count: d.contributionCount,
          level: levelFromString(d.contributionLevel),
        })),
      ),
    },
    languages,
    cachedAt: new Date().toISOString(),
  };

  return stats;
}

async function fetchAllRepos(headers: Record<string, string>): Promise<GitHubRepoResponse[]> {
  const repos: GitHubRepoResponse[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const response = await fetch(
      `https://api.github.com/user/repos?per_page=${perPage}&page=${page}&affiliation=owner`,
      { headers },
    );

    if (!response.ok) break;

    const pageRepos = (await response.json()) as GitHubRepoResponse[];
    repos.push(...pageRepos);

    if (pageRepos.length < perPage) break;
    page++;
  }

  return repos;
}

async function fetchContributions(
  pat: string,
): Promise<GitHubGraphQLResponse["data"]["user"]["contributionsCollection"]> {
  const query = `
    query {
      user(login: "${GITHUB_USERNAME}") {
        contributionsCollection {
          totalCommitContributions
          totalPullRequestContributions
          totalIssueContributions
          contributionCalendar {
            totalContributions
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

  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${pat}`,
      "Content-Type": "application/json",
      "User-Agent": "eve0415-website",
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error(`GitHub GraphQL error: ${response.status}`);
  }

  const data = (await response.json()) as GitHubGraphQLResponse;
  return data.data.user.contributionsCollection;
}

function calculateLanguageStats(repos: GitHubRepoResponse[]): LanguageStat[] {
  const languageCounts: Record<string, number> = {};
  let totalSize = 0;

  for (const repo of repos) {
    if (repo.language && !repo.fork) {
      languageCounts[repo.language] = (languageCounts[repo.language] ?? 0) + repo.size;
      totalSize += repo.size;
    }
  }

  if (totalSize === 0) return [];

  const sorted = Object.entries(languageCounts)
    .map(([name, size]) => ({
      name,
      percentage: (size / totalSize) * 100,
      color: getLanguageColor(name),
    }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 6);

  return sorted;
}

function calculateStreaks(days: Array<{ date: string; count: number }>): {
  currentStreak: number;
  longestStreak: number;
} {
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  // Sort by date descending (most recent first)
  const sortedDays = [...days].sort((a, b) => b.date.localeCompare(a.date));

  // Calculate current streak (from today backwards)
  const todayStr = new Date().toISOString().split("T")[0] ?? "";
  let checkingCurrent = true;

  for (const day of sortedDays) {
    if (day.count > 0) {
      if (checkingCurrent) {
        // Only count current streak if it includes today or yesterday
        const dayDate = new Date(day.date);
        const todayDate = new Date(todayStr);
        const diffDays = Math.floor(
          (todayDate.getTime() - dayDate.getTime()) / (1000 * 60 * 60 * 24),
        );

        if (diffDays <= 1) {
          currentStreak++;
        } else {
          checkingCurrent = false;
        }
      }
    } else {
      checkingCurrent = false;
    }
  }

  // Calculate longest streak
  const sortedAsc = [...days].sort((a, b) => a.date.localeCompare(b.date));
  for (const day of sortedAsc) {
    if (day.count > 0) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  return { currentStreak, longestStreak };
}

function levelFromString(level: string): 0 | 1 | 2 | 3 | 4 {
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

function getLanguageColor(language: string): string {
  // Common language colors from GitHub
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
  };

  return colors[language] ?? "#8b949e";
}

// Get relative time string in Japanese
export function getRelativeTimeJapanese(isoDate: string): string {
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
