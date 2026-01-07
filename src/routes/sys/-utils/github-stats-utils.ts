import type { ContributionLevel } from '#generated/github-graphql';

// Type definitions (moved from github-stats.ts)
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

export function levelFromContributionLevel(level: ContributionLevel): 0 | 1 | 2 | 3 | 4 {
  switch (level) {
    case 'NONE':
      return 0;
    case 'FIRST_QUARTILE':
      return 1;
    case 'SECOND_QUARTILE':
      return 2;
    case 'THIRD_QUARTILE':
      return 3;
    case 'FOURTH_QUARTILE':
      return 4;
    default:
      return 0;
  }
}

export function calculateStreaksJST(days: Array<{ date: string; count: number }>): {
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
  const todayJST = nowJST.toISOString().split('T')[0] ?? '';
  const yesterdayJST = new Date(nowJST.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0] ?? '';

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
      const expectedStr = expected.toISOString().split('T')[0] ?? '';

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

export function getLanguageColor(language: string): string {
  const colors: Record<string, string> = {
    TypeScript: '#3178c6',
    JavaScript: '#f1e05a',
    Python: '#3572A5',
    Rust: '#dea584',
    Go: '#00ADD8',
    Java: '#b07219',
    'C++': '#f34b7d',
    C: '#555555',
    Ruby: '#701516',
    PHP: '#4F5D95',
    Swift: '#F05138',
    Kotlin: '#A97BFF',
    Dart: '#00B4AB',
    Shell: '#89e051',
    HTML: '#e34c26',
    CSS: '#563d7c',
    Vue: '#41b883',
    Svelte: '#ff3e00',
    SCSS: '#c6538c',
    Lua: '#000080',
    Zig: '#ec915c',
    Nix: '#7e7eff',
  };

  return colors[language] ?? '#8b949e';
}

export function getRelativeTimeJapanese(isoDate: string): string {
  if (isoDate === '未取得') {
    return isoDate;
  }

  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return 'たった今';
  if (diffMinutes < 60) return `${diffMinutes}分前`;
  if (diffHours < 24) return `${diffHours}時間前`;
  if (diffDays < 7) return `${diffDays}日前`;

  return date.toLocaleDateString('ja-JP');
}
