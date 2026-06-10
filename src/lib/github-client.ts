// Shared GitHub (Octokit) client factory and identity constants.
// Both the sys stats refresh (REST + GraphQL) and the skills-analysis workflow (GraphQL)
// use the same throttling/retry configuration, so it lives here once.

import { Octokit } from '@octokit/core';
import { retry } from '@octokit/plugin-retry';
import { throttling } from '@octokit/plugin-throttling';

/** GitHub account this site reports on. */
export const GITHUB_USERNAME = 'eve0415';

// Octokit with throttling + retry plugins. Exported so callers can type instances.
export const GitHubClient = Octokit.plugin(throttling, retry);

/** Create an Octokit instance with shared rate-limit handling. */
export const createGitHubClient = (token: string): InstanceType<typeof GitHubClient> =>
  new GitHubClient({
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
      doNotRetry: [429],
    },
  });
