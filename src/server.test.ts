import { createExecutionContext, createScheduledController, waitOnExecutionContext } from 'cloudflare:test';
import { env } from 'cloudflare:workers';
import { afterEach, describe, expect, test, vi } from 'vitest';

// Mock @tanstack/react-start/server-entry to avoid subpath import issues in Vitest
vi.mock('@tanstack/react-start/server-entry', () => ({
  default: {
    fetch: vi.fn().mockResolvedValue(new Response('OK')),
  },
}));

// Mock refreshGitHubStats before importing server
vi.mock('./routes/sys/-utils/github-stats', () => ({
  refreshGitHubStats: vi.fn().mockResolvedValue(undefined),
}));

import { refreshGitHubStats } from './routes/sys/-utils/github-stats';
import server from './server';

describe('server', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('scheduled handler', () => {
    test('calls refreshGitHubStats with env and ctx.waitUntil receives the promise', async () => {
      const ctrl = createScheduledController({ cron: '0 * * * *', scheduledTime: Date.now() });
      const ctx = createExecutionContext();
      await server.scheduled(ctrl, env, ctx);

      await waitOnExecutionContext(ctx);

      expect(refreshGitHubStats).toHaveBeenCalledWith(env);
    });
  });
});
