import { env } from 'cloudflare:workers';
import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import { refreshGitHubStats } from './github-stats';
import { calculateStreaksJST, getLanguageColor, getRelativeTimeJapanese, levelFromContributionLevel } from './github-stats-utils';

// GraphQL response fixture for MSW
const mockGraphQLResponse = {
  data: {
    viewer: {
      login: 'eve0415',
      publicRepos: { totalCount: 10 },
      privateRepos: { totalCount: 5 },
      followers: { totalCount: 100 },
      following: { totalCount: 50 },
      repositories: {
        totalCount: 15,
        pageInfo: { hasNextPage: false, endCursor: null },
        nodes: [
          { name: 'repo1', isFork: false, diskUsage: 1000 },
          { name: 'repo2', isFork: true, diskUsage: 500 },
          { name: 'repo3', isFork: false, diskUsage: 2000 },
        ],
      },
      contributionsCollection: {
        totalCommitContributions: 500,
        totalPullRequestContributions: 50,
        totalIssueContributions: 25,
        contributionCalendar: {
          weeks: [
            {
              contributionDays: [
                { date: '2024-01-14', contributionCount: 5, contributionLevel: 'THIRD_QUARTILE' },
                { date: '2024-01-15', contributionCount: 10, contributionLevel: 'FOURTH_QUARTILE' },
              ],
            },
          ],
        },
      },
    },
  },
};

// Language response fixtures
const mockLanguageResponse = { TypeScript: 50000, JavaScript: 30000 };

// MSW server setup
const server = setupServer(
  http.post('https://api.github.com/graphql', () => {
    return HttpResponse.json(mockGraphQLResponse);
  }),
  http.get('https://api.github.com/repos/eve0415/:repo/languages', () => {
    return HttpResponse.json(mockLanguageResponse);
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('levelFromContributionLevel', () => {
  test('maps NONE to 0', () => {
    expect(levelFromContributionLevel('NONE')).toBe(0);
  });

  test('maps FIRST_QUARTILE to 1', () => {
    expect(levelFromContributionLevel('FIRST_QUARTILE')).toBe(1);
  });

  test('maps SECOND_QUARTILE to 2', () => {
    expect(levelFromContributionLevel('SECOND_QUARTILE')).toBe(2);
  });

  test('maps THIRD_QUARTILE to 3', () => {
    expect(levelFromContributionLevel('THIRD_QUARTILE')).toBe(3);
  });

  test('maps FOURTH_QUARTILE to 4', () => {
    expect(levelFromContributionLevel('FOURTH_QUARTILE')).toBe(4);
  });

  test('defaults to 0 for unknown value', () => {
    // @ts-expect-error Testing invalid input
    expect(levelFromContributionLevel('UNKNOWN')).toBe(0);
  });
});

describe('getLanguageColor', () => {
  test.each([
    ['TypeScript', '#3178c6'],
    ['JavaScript', '#f1e05a'],
    ['Python', '#3572A5'],
    ['Rust', '#dea584'],
    ['Go', '#00ADD8'],
    ['Java', '#b07219'],
    ['C++', '#f34b7d'],
    ['C', '#555555'],
    ['Ruby', '#701516'],
    ['PHP', '#4F5D95'],
    ['Swift', '#F05138'],
    ['Kotlin', '#A97BFF'],
    ['Dart', '#00B4AB'],
    ['Shell', '#89e051'],
    ['HTML', '#e34c26'],
    ['CSS', '#563d7c'],
    ['Vue', '#41b883'],
    ['Svelte', '#ff3e00'],
    ['SCSS', '#c6538c'],
    ['Lua', '#000080'],
    ['Zig', '#ec915c'],
    ['Nix', '#7e7eff'],
  ])('returns correct color for %s', (language, expectedColor) => {
    expect(getLanguageColor(language)).toBe(expectedColor);
  });

  test('returns default color for unknown language', () => {
    expect(getLanguageColor('Unknown')).toBe('#8b949e');
    expect(getLanguageColor('Brainfuck')).toBe('#8b949e');
    expect(getLanguageColor('')).toBe('#8b949e');
  });
});

describe('calculateStreaksJST', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('returns zeros for empty array', () => {
    const result = calculateStreaksJST([]);
    expect(result).toEqual({ currentStreak: 0, longestStreak: 0 });
  });

  test('returns zeros when all days have zero contributions', () => {
    // Set time to 2024-01-15 12:00:00 UTC (21:00 JST)
    vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));

    const days = [
      { date: '2024-01-14', count: 0 },
      { date: '2024-01-13', count: 0 },
      { date: '2024-01-12', count: 0 },
    ];

    const result = calculateStreaksJST(days);
    expect(result).toEqual({ currentStreak: 0, longestStreak: 0 });
  });

  test('calculates current streak starting today', () => {
    // Set time to 2024-01-15 12:00:00 UTC (21:00 JST, still Jan 15)
    vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));

    const days = [
      { date: '2024-01-15', count: 5 },
      { date: '2024-01-14', count: 3 },
      { date: '2024-01-13', count: 2 },
      { date: '2024-01-12', count: 0 }, // Gap
    ];

    const result = calculateStreaksJST(days);
    expect(result.currentStreak).toBe(3);
    expect(result.longestStreak).toBe(3);
  });

  test('calculates current streak starting yesterday when today has no contributions', () => {
    // Set time to 2024-01-15 12:00:00 UTC (21:00 JST)
    vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));

    const days = [
      { date: '2024-01-15', count: 0 }, // Today, no contributions
      { date: '2024-01-14', count: 3 }, // Yesterday has contributions
      { date: '2024-01-13', count: 2 },
      { date: '2024-01-12', count: 1 },
    ];

    const result = calculateStreaksJST(days);
    expect(result.currentStreak).toBe(3);
    expect(result.longestStreak).toBe(3);
  });

  test('returns zero current streak when yesterday has no contributions', () => {
    // Set time to 2024-01-15 12:00:00 UTC
    vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));

    const days = [
      { date: '2024-01-15', count: 0 },
      { date: '2024-01-14', count: 0 }, // Yesterday, no contributions
      { date: '2024-01-13', count: 5 },
      { date: '2024-01-12', count: 3 },
    ];

    const result = calculateStreaksJST(days);
    expect(result.currentStreak).toBe(0);
    expect(result.longestStreak).toBe(2);
  });

  test('handles gap breaking streak', () => {
    vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));

    const days = [
      { date: '2024-01-15', count: 1 },
      { date: '2024-01-14', count: 1 },
      { date: '2024-01-13', count: 0 }, // Gap
      { date: '2024-01-12', count: 1 },
      { date: '2024-01-11', count: 1 },
      { date: '2024-01-10', count: 1 },
    ];

    const result = calculateStreaksJST(days);
    expect(result.currentStreak).toBe(2);
    expect(result.longestStreak).toBe(3);
  });

  test('calculates longest streak across multiple gaps', () => {
    vi.setSystemTime(new Date('2024-01-20T12:00:00Z'));

    const days = [
      { date: '2024-01-20', count: 1 },
      { date: '2024-01-19', count: 0 }, // Gap
      { date: '2024-01-18', count: 1 },
      { date: '2024-01-17', count: 1 },
      { date: '2024-01-16', count: 1 },
      { date: '2024-01-15', count: 1 },
      { date: '2024-01-14', count: 1 },
      { date: '2024-01-13', count: 0 }, // Gap
      { date: '2024-01-12', count: 1 },
      { date: '2024-01-11', count: 1 },
    ];

    const result = calculateStreaksJST(days);
    expect(result.currentStreak).toBe(1);
    expect(result.longestStreak).toBe(5);
  });

  test('handles month boundary crossing', () => {
    vi.setSystemTime(new Date('2024-02-02T12:00:00Z'));

    const days = [
      { date: '2024-02-02', count: 1 },
      { date: '2024-02-01', count: 1 },
      { date: '2024-01-31', count: 1 },
      { date: '2024-01-30', count: 1 },
    ];

    const result = calculateStreaksJST(days);
    expect(result.currentStreak).toBe(4);
    expect(result.longestStreak).toBe(4);
  });

  test('handles year boundary crossing', () => {
    vi.setSystemTime(new Date('2024-01-02T12:00:00Z'));

    const days = [
      { date: '2024-01-02', count: 1 },
      { date: '2024-01-01', count: 1 },
      { date: '2023-12-31', count: 1 },
      { date: '2023-12-30', count: 1 },
    ];

    const result = calculateStreaksJST(days);
    expect(result.currentStreak).toBe(4);
    expect(result.longestStreak).toBe(4);
  });

  test('handles unsorted input', () => {
    vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));

    // Days in random order
    const days = [
      { date: '2024-01-12', count: 1 },
      { date: '2024-01-15', count: 1 },
      { date: '2024-01-13', count: 1 },
      { date: '2024-01-14', count: 1 },
    ];

    const result = calculateStreaksJST(days);
    expect(result.currentStreak).toBe(4);
    expect(result.longestStreak).toBe(4);
  });

  test('handles single day with contributions', () => {
    vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));

    const days = [{ date: '2024-01-15', count: 5 }];

    const result = calculateStreaksJST(days);
    expect(result.currentStreak).toBe(1);
    expect(result.longestStreak).toBe(1);
  });

  test('JST timezone calculation - just before midnight UTC is still same day in JST', () => {
    // 23:00 UTC on Jan 14 = 08:00 JST on Jan 15
    vi.setSystemTime(new Date('2024-01-14T23:00:00Z'));

    const days = [
      { date: '2024-01-15', count: 1 }, // This is "today" in JST
      { date: '2024-01-14', count: 1 },
    ];

    const result = calculateStreaksJST(days);
    expect(result.currentStreak).toBe(2);
  });

  // Edge case tests for uncovered lines (312, 348, 365)

  test('handles multi-day gap in longest streak calculation (line 312)', () => {
    // Tests the case where diffDays > 1, triggering tempStreak = 1
    vi.setSystemTime(new Date('2024-01-20T12:00:00Z'));

    const days = [
      { date: '2024-01-20', count: 1 },
      { date: '2024-01-19', count: 1 },
      { date: '2024-01-18', count: 1 },
      // Gap of 3 days (not just 1)
      { date: '2024-01-14', count: 1 },
      { date: '2024-01-13', count: 1 },
      { date: '2024-01-12', count: 1 },
      { date: '2024-01-11', count: 1 },
    ];

    const result = calculateStreaksJST(days);
    expect(result.longestStreak).toBe(4); // The older sequence is longer
    expect(result.currentStreak).toBe(3);
  });

  test('breaks when only old data exists past yesterday (line 348)', () => {
    // Tests the case where day.date < yesterdayJST with no today/yesterday contributions
    vi.setSystemTime(new Date('2024-01-20T12:00:00Z'));

    // Only old data, nothing for today or yesterday
    const days = [
      { date: '2024-01-15', count: 5 },
      { date: '2024-01-14', count: 3 },
      { date: '2024-01-13', count: 2 },
    ];

    const result = calculateStreaksJST(days);
    expect(result.currentStreak).toBe(0); // No current streak since no recent contributions
    expect(result.longestStreak).toBe(3);
  });

  test('breaks current streak when expected date is skipped (line 365)', () => {
    // Tests the case where during backward traversal, we skip a day
    vi.setSystemTime(new Date('2024-01-20T12:00:00Z'));

    const days = [
      { date: '2024-01-20', count: 1 }, // Today
      { date: '2024-01-19', count: 1 }, // Yesterday
      // Missing 2024-01-18
      { date: '2024-01-17', count: 1 }, // This triggers line 365 break
      { date: '2024-01-16', count: 1 },
    ];

    const result = calculateStreaksJST(days);
    expect(result.currentStreak).toBe(2); // Only today and yesterday
    expect(result.longestStreak).toBe(2);
  });

  test('handles JST midnight boundary edge case', () => {
    // 14:59 UTC on Jan 15 = 23:59 JST on Jan 15
    // 15:01 UTC on Jan 15 = 00:01 JST on Jan 16
    vi.setSystemTime(new Date('2024-01-15T15:01:00Z'));

    const days = [
      { date: '2024-01-16', count: 1 }, // This is "today" in JST (just after midnight)
      { date: '2024-01-15', count: 1 },
      { date: '2024-01-14', count: 1 },
    ];

    const result = calculateStreaksJST(days);
    expect(result.currentStreak).toBe(3);
  });
});

describe('getRelativeTimeJapanese', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('returns special string for 未取得', () => {
    expect(getRelativeTimeJapanese('未取得')).toBe('未取得');
  });

  test('returns たった今 for less than 1 minute', () => {
    vi.setSystemTime(new Date('2024-01-15T12:00:30Z'));
    expect(getRelativeTimeJapanese('2024-01-15T12:00:00Z')).toBe('たった今');
  });

  test('returns minutes for less than 60 minutes', () => {
    vi.setSystemTime(new Date('2024-01-15T12:30:00Z'));
    expect(getRelativeTimeJapanese('2024-01-15T12:00:00Z')).toBe('30分前');

    vi.setSystemTime(new Date('2024-01-15T12:01:00Z'));
    expect(getRelativeTimeJapanese('2024-01-15T12:00:00Z')).toBe('1分前');

    vi.setSystemTime(new Date('2024-01-15T12:59:00Z'));
    expect(getRelativeTimeJapanese('2024-01-15T12:00:00Z')).toBe('59分前');
  });

  test('returns hours for less than 24 hours', () => {
    vi.setSystemTime(new Date('2024-01-15T14:00:00Z'));
    expect(getRelativeTimeJapanese('2024-01-15T12:00:00Z')).toBe('2時間前');

    vi.setSystemTime(new Date('2024-01-16T11:00:00Z'));
    expect(getRelativeTimeJapanese('2024-01-15T12:00:00Z')).toBe('23時間前');
  });

  test('returns days for less than 7 days', () => {
    vi.setSystemTime(new Date('2024-01-16T12:00:00Z'));
    expect(getRelativeTimeJapanese('2024-01-15T12:00:00Z')).toBe('1日前');

    vi.setSystemTime(new Date('2024-01-21T12:00:00Z'));
    expect(getRelativeTimeJapanese('2024-01-15T12:00:00Z')).toBe('6日前');
  });

  test('returns formatted date for 7 days or more', () => {
    vi.setSystemTime(new Date('2024-01-22T12:00:00Z'));
    const result = getRelativeTimeJapanese('2024-01-15T12:00:00Z');
    // Should be formatted as Japanese date locale
    expect(result).toMatch(/2024/);
    expect(result).toMatch(/1/);
    expect(result).toMatch(/15/);
  });
});

// Note: getGitHubStats is a server function (createServerFn) that requires TanStack Start context.
// Its behavior is tested indirectly through integration/e2e tests.
// The underlying logic (KV read + fallback) is straightforward and covered by the handler's implementation.

describe('refreshGitHubStats', () => {
  test('fetches from GitHub API and stores in KV', async () => {
    // Call refresh
    await refreshGitHubStats(env);

    // Check KV was updated by reading from it
    const storedValue = await env.CACHE.get('github_stats_eve0415', 'json');
    expect(storedValue).toBeDefined();
    expect(storedValue).toHaveProperty('user');
    expect(storedValue).toHaveProperty('contributions');
    expect(storedValue).toHaveProperty('languages');
  });

  test('handles empty language responses gracefully', async () => {
    // Override the language endpoint to return empty object (no languages)
    server.use(
      http.get('https://api.github.com/repos/eve0415/:repo/languages', () => {
        return HttpResponse.json({});
      }),
    );

    await refreshGitHubStats(env);

    const storedValue = await env.CACHE.get<{ languages: unknown[] }>('github_stats_eve0415', 'json');

    expect(storedValue).toBeDefined();
    expect(storedValue?.languages).toEqual([]);
  });

  // Note: Rate limit tests with Octokit's retry plugin are difficult to reliably test
  // as they involve timing-sensitive retry mechanisms. The plugin is well-tested upstream
  // and the callback handlers (onRateLimit, onSecondaryRateLimit) simply log and return.
});
