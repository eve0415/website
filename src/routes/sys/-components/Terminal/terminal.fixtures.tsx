import type { GitHubStats } from '../../-utils/github-stats-utils';

/**
 * Fixed mock GitHubStats for consistent test snapshots.
 * All values are deterministic to ensure snapshot stability.
 */
export const mockGitHubStats: GitHubStats = {
  user: {
    login: 'eve0415',
    publicRepos: 42,
    privateRepos: 10,
    totalRepos: 52,
    followers: 100,
    following: 50,
  },
  contributions: {
    totalCommits: 1337,
    totalPRs: 256,
    totalIssues: 128,
    currentStreak: 7,
    longestStreak: 30,
    contributionCalendar: [
      { date: '2024-01-01', count: 5, level: 2 },
      { date: '2024-01-02', count: 10, level: 3 },
      { date: '2024-01-03', count: 15, level: 4 },
      { date: '2024-01-04', count: 0, level: 0 },
      { date: '2024-01-05', count: 3, level: 1 },
    ],
  },
  languages: [
    { name: 'TypeScript', percentage: 45, color: '#3178c6' },
    { name: 'Rust', percentage: 25, color: '#dea584' },
    { name: 'Go', percentage: 15, color: '#00ADD8' },
    { name: 'Python', percentage: 10, color: '#3572A5' },
    { name: 'Other', percentage: 5, color: '#8b949e' },
  ],
  cachedAt: '2024-01-01T00:00:00Z',
};

/**
 * Mock command context for testing command execution.
 */
export const mockCommandContext = {
  stats: mockGitHubStats,
  onNavigateHome: () => {},
};

/**
 * Creates a mock command context with a custom navigate handler.
 */
export const createMockCommandContext = (onNavigateHome = () => {}) => ({
  stats: mockGitHubStats,
  onNavigateHome,
});
