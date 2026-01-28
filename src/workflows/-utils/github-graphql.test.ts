/* oxlint-disable typescript-eslint(no-unsafe-type-assertion) -- Test mocks require type assertions for request.json() parsing */
// Unit tests for GitHub GraphQL client utility

import type { RateLimitMetrics } from './github-graphql';

import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import {
  DEFAULT_RATE_LIMIT_METRICS,
  GITHUB_USERNAME,
  calculateDynamicThreshold,
  createGitHubClient,
  extractRateLimit,
  fetchRepoCommits,
  fetchRepoPRs,
  fetchUserRepos,
  isPRAuthoredByUser,
} from './github-graphql';

// Mock GraphQL responses
const mockRateLimitResponse = {
  remaining: 4500,
  cost: 1,
  resetAt: '2024-01-15T12:00:00Z',
};

const mockUserReposResponse = {
  rateLimit: mockRateLimitResponse,
  viewer: {
    repositories: {
      nodes: [
        {
          id: 'R_123',
          databaseId: 123,
          name: 'test-repo',
          nameWithOwner: 'eve0415/test-repo',
          isPrivate: false,
          isFork: false,
          defaultBranchRef: { name: 'main' },
          primaryLanguage: { name: 'TypeScript' },
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ],
      pageInfo: {
        hasNextPage: false,
        endCursor: undefined,
      },
    },
  },
};

const mockCommitsResponse = {
  rateLimit: mockRateLimitResponse,
  repository: {
    defaultBranchRef: {
      target: {
        history: {
          nodes: [
            {
              oid: 'abc123',
              messageHeadline: 'feat: add feature',
              committedDate: '2024-01-10T10:00:00Z',
              additions: 50,
              deletions: 10,
              changedFilesIfAvailable: 5,
              author: { user: { login: 'eve0415' } },
            },
          ],
          pageInfo: {
            hasNextPage: false,
            endCursor: undefined,
          },
        },
      },
    },
  },
};

const mockPRsResponse = {
  rateLimit: mockRateLimitResponse,
  repository: {
    pullRequests: {
      nodes: [
        {
          id: 'PR_1',
          databaseId: 1,
          number: 42,
          title: 'Add new feature',
          state: 'MERGED',
          body: 'This PR adds a new feature',
          merged: true,
          additions: 100,
          deletions: 20,
          changedFiles: 10,
          commits: { totalCount: 5 },
          createdAt: '2024-01-01T00:00:00Z',
          mergedAt: '2024-01-05T00:00:00Z',
          closedAt: '2024-01-05T00:00:00Z',
          updatedAt: '2024-01-05T00:00:00Z',
          author: { login: 'eve0415' },
          reviews: {
            nodes: [
              {
                id: 'PRR_1',
                databaseId: 1,
                state: 'APPROVED',
                body: 'LGTM',
                submittedAt: '2024-01-04T00:00:00Z',
                author: { login: 'reviewer' },
              },
            ],
            pageInfo: {
              hasNextPage: false,
              endCursor: undefined,
            },
          },
        },
      ],
      pageInfo: {
        hasNextPage: false,
        endCursor: undefined,
      },
    },
  },
};

// Setup MSW server
const server = setupServer(
  http.post('https://api.github.com/graphql', async ({ request }) => {
    const body = (await request.json()) as { query: string; variables?: Record<string, unknown> };
    const { query } = body;

    if (query.includes('UserRepos')) return HttpResponse.json({ data: mockUserReposResponse });

    if (query.includes('RepoCommits')) return HttpResponse.json({ data: mockCommitsResponse });

    if (query.includes('RepoPullRequests')) return HttpResponse.json({ data: mockPRsResponse });

    return HttpResponse.json({ errors: [{ message: 'Unknown query' }] }, { status: 400 });
  }),
);

beforeAll(() => {
  server.listen();
});
afterEach(() => {
  server.resetHandlers();
});
afterAll(() => {
  server.close();
});

describe('createGitHubClient', () => {
  it('creates an Octokit client with auth token', () => {
    const client = createGitHubClient('test-token');
    expect(client).toBeDefined();
  });
});

describe('extractRateLimit', () => {
  it('extracts rate limit from response with rateLimit field', () => {
    const response = {
      rateLimit: {
        remaining: 4500,
        cost: 1,
        resetAt: '2024-01-15T12:00:00Z',
      },
    };

    const result = extractRateLimit(response);

    expect(result.remaining).toBe(4500);
    expect(result.cost).toBe(1);
    expect(result.resetAt).toBe(Math.floor(new Date('2024-01-15T12:00:00Z').getTime() / 1000));
  });

  it('returns default rate limit when rateLimit is null', () => {
    const result = extractRateLimit({ rateLimit: null });

    expect(result.remaining).toBe(5000);
    expect(result.cost).toBe(1);
  });

  it('returns default rate limit when rateLimit is undefined', () => {
    const result = extractRateLimit({});

    expect(result.remaining).toBe(5000);
    expect(result.cost).toBe(1);
  });
});

describe('fetchUserRepos', () => {
  it('fetches user repositories with rate limit', async () => {
    const client = createGitHubClient('test-token');
    const result = await fetchUserRepos(client);

    expect(result.data.viewer.repositories.nodes).toHaveLength(1);
    expect(result.data.viewer.repositories.nodes?.[0]?.name).toBe('test-repo');
    expect(result.rateLimit.remaining).toBe(4500);
  });

  it('passes cursor for pagination', async () => {
    let capturedVariables: Record<string, unknown> | undefined;

    server.use(
      http.post('https://api.github.com/graphql', async ({ request }) => {
        const body = (await request.json()) as { query: string; variables?: Record<string, unknown> };
        capturedVariables = body.variables;
        return HttpResponse.json({ data: mockUserReposResponse });
      }),
    );

    const client = createGitHubClient('test-token');
    await fetchUserRepos(client, 'cursor123');

    expect(capturedVariables?.['cursor']).toBe('cursor123');
  });
});

describe('fetchRepoCommits', () => {
  it('fetches commits for a repository', async () => {
    const client = createGitHubClient('test-token');
    const result = await fetchRepoCommits(client, 'eve0415', 'test-repo');

    const history = result.data.repository?.defaultBranchRef?.target;
    expect(history && 'history' in history ? history.history.nodes : []).toHaveLength(1);
    expect(result.rateLimit.remaining).toBe(4500);
  });

  it('passes since parameter for incremental sync', async () => {
    let capturedVariables: Record<string, unknown> | undefined;

    server.use(
      http.post('https://api.github.com/graphql', async ({ request }) => {
        const body = (await request.json()) as { query: string; variables?: Record<string, unknown> };
        capturedVariables = body.variables;
        return HttpResponse.json({ data: mockCommitsResponse });
      }),
    );

    const client = createGitHubClient('test-token');
    await fetchRepoCommits(client, 'eve0415', 'test-repo', '2024-01-01T00:00:00Z', 'cursor456');

    expect(capturedVariables?.['since']).toBe('2024-01-01T00:00:00Z');
    expect(capturedVariables?.['cursor']).toBe('cursor456');
  });
});

describe('fetchRepoPRs', () => {
  it('fetches pull requests for a repository', async () => {
    const client = createGitHubClient('test-token');
    const result = await fetchRepoPRs(client, 'eve0415', 'test-repo');

    expect(result.data.repository?.pullRequests.nodes).toHaveLength(1);
    expect(result.data.repository?.pullRequests.nodes?.[0]?.title).toBe('Add new feature');
    expect(result.rateLimit.remaining).toBe(4500);
  });

  it('includes nested reviews in response', async () => {
    const client = createGitHubClient('test-token');
    const result = await fetchRepoPRs(client, 'eve0415', 'test-repo');

    const pr = result.data.repository?.pullRequests.nodes?.[0];
    expect(pr?.reviews?.nodes).toHaveLength(1);
    expect(pr?.reviews?.nodes?.[0]?.state).toBe('APPROVED');
  });
});

describe('calculateDynamicThreshold', () => {
  it('calculates threshold based on remaining work', () => {
    const metrics: RateLimitMetrics = {
      avgRequestsPerRepo: 10,
      lastRunRepoCount: 50,
      lastRunRequestCount: 500,
      updatedAt: '2024-01-01T00:00:00Z',
    };

    // 30 repos remaining * 10 avg = 300 estimated requests
    const threshold = calculateDynamicThreshold(metrics, 50, 20);
    expect(threshold).toBe(300);
  });

  it('returns minimum threshold of 50', () => {
    const metrics: RateLimitMetrics = {
      avgRequestsPerRepo: 1,
      lastRunRepoCount: 10,
      lastRunRequestCount: 10,
      updatedAt: '2024-01-01T00:00:00Z',
    };

    // 2 repos remaining * 1 avg = 2, but minimum is 50
    const threshold = calculateDynamicThreshold(metrics, 10, 8);
    expect(threshold).toBe(50);
  });

  it('returns maximum threshold of 500', () => {
    const metrics: RateLimitMetrics = {
      avgRequestsPerRepo: 100,
      lastRunRepoCount: 100,
      lastRunRequestCount: 10000,
      updatedAt: '2024-01-01T00:00:00Z',
    };

    // 50 repos remaining * 100 avg = 5000, but max is 500
    const threshold = calculateDynamicThreshold(metrics, 100, 50);
    expect(threshold).toBe(500);
  });

  it('uses default metrics values correctly', () => {
    // DEFAULT_RATE_LIMIT_METRICS.avgRequestsPerRepo = 12
    const threshold = calculateDynamicThreshold(DEFAULT_RATE_LIMIT_METRICS, 20, 10);
    // 10 remaining * 12 = 120
    expect(threshold).toBe(120);
  });
});

describe('isPRAuthoredByUser', () => {
  it('returns true for matching login (case-insensitive)', () => {
    expect(isPRAuthoredByUser('eve0415')).toBeTruthy();
    expect(isPRAuthoredByUser('EVE0415')).toBeTruthy();
    expect(isPRAuthoredByUser('Eve0415')).toBeTruthy();
  });

  it('returns false for non-matching login', () => {
    expect(isPRAuthoredByUser('other-user')).toBeFalsy();
  });

  it('returns false when login is null', () => {
    expect(isPRAuthoredByUser(null)).toBeFalsy();
  });

  it('returns false when login is undefined', () => {
    const undefinedValue = undefined;
    expect(isPRAuthoredByUser(undefinedValue)).toBeFalsy();
  });
});

describe('gITHUB_USERNAME constant', () => {
  it('is exported and has expected value', () => {
    expect(GITHUB_USERNAME).toBe('eve0415');
  });
});

describe('error handling', () => {
  it('handles GraphQL errors gracefully', async () => {
    server.use(
      http.post('https://api.github.com/graphql', () =>
        HttpResponse.json(
          {
            errors: [{ message: 'API rate limit exceeded' }],
          },
          { status: 200 },
        ),
      ),
    );

    const client = createGitHubClient('test-token');

    // Octokit throws on GraphQL errors
    await expect(fetchUserRepos(client)).rejects.toThrow(/rate limit/i);
  });
});
