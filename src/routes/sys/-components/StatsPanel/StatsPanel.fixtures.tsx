import type { GitHubStats } from '../../-utils/github-stats-utils';

export const sampleStats: GitHubStats = {
  user: {
    login: 'eve0415',
    publicRepos: 45,
    privateRepos: 30,
    totalRepos: 75,
    followers: 150,
    following: 50,
  },
  contributions: {
    totalCommits: 2847,
    totalPRs: 234,
    totalIssues: 89,
    currentStreak: 42,
    longestStreak: 156,
    contributionCalendar: [],
  },
  languages: [],
  cachedAt: new Date().toISOString(),
};

export const lowActivityStats: GitHubStats = {
  user: {
    login: 'newuser',
    publicRepos: 5,
    privateRepos: 2,
    totalRepos: 7,
    followers: 10,
    following: 20,
  },
  contributions: {
    totalCommits: 50,
    totalPRs: 5,
    totalIssues: 3,
    currentStreak: 3,
    longestStreak: 10,
    contributionCalendar: [],
  },
  languages: [],
  cachedAt: new Date().toISOString(),
};

export const highActivityStats: GitHubStats = {
  user: {
    login: 'poweruser',
    publicRepos: 200,
    privateRepos: 100,
    totalRepos: 300,
    followers: 5000,
    following: 200,
  },
  contributions: {
    totalCommits: 15000,
    totalPRs: 1500,
    totalIssues: 500,
    currentStreak: 365,
    longestStreak: 730,
    contributionCalendar: [],
  },
  languages: [],
  cachedAt: new Date().toISOString(),
};

export const emptyStats: GitHubStats = {
  user: {
    login: 'empty',
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
