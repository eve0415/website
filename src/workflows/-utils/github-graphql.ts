// GitHub GraphQL client with rate limit handling for skills analysis workflow

import type {
  RepoCommitsQuery,
  RepoCommitsQueryVariables,
  RepoPullRequestsQuery,
  RepoPullRequestsQueryVariables,
  UserReposQuery,
  UserReposQueryVariables,
} from '#generated/github-graphql';

import { Octokit } from '@octokit/core';
import { retry } from '@octokit/plugin-retry';
import { throttling } from '@octokit/plugin-throttling';

const GITHUB_USERNAME = 'eve0415';

/** Rate limit info extracted from GraphQL response */
export interface GraphQLRateLimit {
  remaining: number;
  cost: number;
  resetAt: number; // Unix timestamp in seconds
}

/** Default rate limit for error cases */
const DEFAULT_RATE_LIMIT: GraphQLRateLimit = {
  remaining: 5000,
  cost: 1,
  resetAt: Math.floor(Date.now() / 1000) + 3600,
};

// Create Octokit with plugins
const MyOctokit = Octokit.plugin(throttling, retry);

/** Create an Octokit instance configured for GitHub GraphQL */
export function createGitHubClient(token: string): InstanceType<typeof MyOctokit> {
  return new MyOctokit({
    auth: token,
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
}

/** Extract rate limit from GraphQL response */
export function extractRateLimit(response: { rateLimit?: { remaining: number; cost: number; resetAt: string } | null }): GraphQLRateLimit {
  if (!response.rateLimit) {
    return DEFAULT_RATE_LIMIT;
  }

  return {
    remaining: response.rateLimit.remaining,
    cost: response.rateLimit.cost,
    resetAt: Math.floor(new Date(response.rateLimit.resetAt).getTime() / 1000),
  };
}

// GraphQL query strings
const USER_REPOS_QUERY = /* GraphQL */ `
  query UserRepos($cursor: String) {
    rateLimit {
      remaining
      cost
      resetAt
    }
    viewer {
      email
      repositories(first: 100, after: $cursor, ownerAffiliations: [OWNER, ORGANIZATION_MEMBER]) {
        nodes {
          id
          databaseId
          name
          nameWithOwner
          isPrivate
          isFork
          defaultBranchRef {
            name
          }
          primaryLanguage {
            name
          }
          createdAt
          updatedAt
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

const REPO_COMMITS_QUERY = /* GraphQL */ `
  query RepoCommits($owner: String!, $name: String!, $since: GitTimestamp, $cursor: String) {
    rateLimit {
      remaining
      cost
      resetAt
    }
    repository(owner: $owner, name: $name) {
      defaultBranchRef {
        target {
          ... on Commit {
            history(first: 100, since: $since, after: $cursor) {
              nodes {
                oid
                messageHeadline
                committedDate
                additions
                deletions
                changedFilesIfAvailable
                author {
                  email
                }
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
          }
        }
      }
    }
  }
`;

const REPO_PULL_REQUESTS_QUERY = /* GraphQL */ `
  query RepoPullRequests($owner: String!, $name: String!, $cursor: String) {
    rateLimit {
      remaining
      cost
      resetAt
    }
    repository(owner: $owner, name: $name) {
      pullRequests(first: 50, orderBy: { field: UPDATED_AT, direction: DESC }, after: $cursor) {
        nodes {
          id
          databaseId
          number
          title
          state
          body
          merged
          additions
          deletions
          changedFiles
          commits {
            totalCount
          }
          createdAt
          mergedAt
          closedAt
          updatedAt
          author {
            login
          }
          reviews(first: 50) {
            nodes {
              id
              databaseId
              state
              body
              submittedAt
              author {
                login
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

export interface FetchUserReposResult {
  data: UserReposQuery;
  rateLimit: GraphQLRateLimit;
}

export interface FetchRepoCommitsResult {
  data: RepoCommitsQuery;
  rateLimit: GraphQLRateLimit;
}

export interface FetchRepoPRsResult {
  data: RepoPullRequestsQuery;
  rateLimit: GraphQLRateLimit;
}

/** Fetch user repositories with rate limit info */
export async function fetchUserRepos(octokit: InstanceType<typeof MyOctokit>, cursor?: string | null): Promise<FetchUserReposResult> {
  const variables: UserReposQueryVariables = {};
  if (cursor) variables.cursor = cursor;

  const data = await octokit.graphql<UserReposQuery>(USER_REPOS_QUERY, variables);

  return {
    data,
    rateLimit: extractRateLimit(data),
  };
}

/** Fetch commits for a repository with rate limit info */
export async function fetchRepoCommits(
  octokit: InstanceType<typeof MyOctokit>,
  owner: string,
  name: string,
  since?: string | null,
  cursor?: string | null,
): Promise<FetchRepoCommitsResult> {
  const variables: RepoCommitsQueryVariables = { owner, name };
  if (since) variables.since = since;
  if (cursor) variables.cursor = cursor;

  const data = await octokit.graphql<RepoCommitsQuery>(REPO_COMMITS_QUERY, variables);

  return {
    data,
    rateLimit: extractRateLimit(data),
  };
}

/** Fetch pull requests for a repository with rate limit info */
export async function fetchRepoPRs(octokit: InstanceType<typeof MyOctokit>, owner: string, name: string, cursor?: string | null): Promise<FetchRepoPRsResult> {
  const variables: RepoPullRequestsQueryVariables = { owner, name };
  if (cursor) variables.cursor = cursor;

  const data = await octokit.graphql<RepoPullRequestsQuery>(REPO_PULL_REQUESTS_QUERY, variables);

  return {
    data,
    rateLimit: extractRateLimit(data),
  };
}

/** Rate limit metrics stored in KV for dynamic threshold calculation */
export interface RateLimitMetrics {
  avgRequestsPerRepo: number;
  lastRunRepoCount: number;
  lastRunRequestCount: number;
  updatedAt: string;
}

/** Default metrics for first run */
export const DEFAULT_RATE_LIMIT_METRICS: RateLimitMetrics = {
  avgRequestsPerRepo: 12,
  lastRunRepoCount: 0,
  lastRunRequestCount: 0,
  updatedAt: new Date().toISOString(),
};

/** Calculate dynamic rate limit threshold based on remaining work */
export function calculateDynamicThreshold(metrics: RateLimitMetrics, totalRepos: number, processedRepos: number): number {
  const reposRemaining = totalRepos - processedRepos;
  const estimatedRequestsNeeded = reposRemaining * metrics.avgRequestsPerRepo;
  // Minimum 50, maximum 500
  return Math.max(50, Math.min(500, estimatedRequestsNeeded));
}

/** Check if a commit was authored by the target user */
export function isAuthoredByUser(authorEmail: string | null | undefined, userEmail: string | null | undefined): boolean {
  if (!authorEmail || !userEmail) return false;
  return authorEmail.toLowerCase() === userEmail.toLowerCase();
}

/** Check if a PR/review was authored by the target user */
export function isPRAuthoredByUser(authorLogin: string | null | undefined): boolean {
  if (!authorLogin) return false;
  return authorLogin.toLowerCase() === GITHUB_USERNAME.toLowerCase();
}

export { GITHUB_USERNAME };
