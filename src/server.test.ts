import { createExecutionContext, createScheduledController, waitOnExecutionContext } from 'cloudflare:test';
import { env } from 'cloudflare:workers';
import { afterEach, describe, expect, test, vi } from 'vite-plus/test';

const mockHandlerFetch = vi.hoisted(() => vi.fn());
const mockRefreshGitHubStats = vi.hoisted(() => vi.fn<() => Promise<void>>());

vi.mock('@tanstack/react-start/server-entry', () => ({
  default: {
    fetch: mockHandlerFetch,
  },
}));

vi.mock('./routes/sys/-utils/github-stats', () => ({
  refreshGitHubStats: mockRefreshGitHubStats,
}));

import server from './server';

describe('server', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('fetch handler', () => {
    test('delegates to TanStack handler and does not call refreshGitHubStats', async () => {
      mockHandlerFetch.mockReturnValue(new Response('OK'));

      const request = new Request('https://eve0415.net/') as Request<unknown, IncomingRequestCfProperties>;
      const ctx = createExecutionContext();
      const response = await server.fetch(request, env, ctx);

      await waitOnExecutionContext(ctx);

      expect(response).toBeInstanceOf(Response);
      await expect(response.text()).resolves.toBe('OK');
      expect(mockRefreshGitHubStats).not.toHaveBeenCalled();
    });
  });

  describe('scheduled handler', () => {
    test('hourly cron calls refreshGitHubStats with env and ctx.waitUntil receives the promise', async () => {
      mockRefreshGitHubStats.mockResolvedValue();

      const ctrl = createScheduledController({ cron: '0 * * * *', scheduledTime: Date.now() });
      const ctx = createExecutionContext();
      server.scheduled(ctrl, env, ctx);

      await waitOnExecutionContext(ctx);

      expect(mockRefreshGitHubStats).toHaveBeenCalledWith(env);
    });

    test('weekly cron triggers the workflow but does not call refreshGitHubStats', async () => {
      mockRefreshGitHubStats.mockResolvedValue();
      const createSpy = vi.spyOn(env.SKILLS_WORKFLOW, 'create').mockResolvedValue();

      const ctrl = createScheduledController({ cron: '30 18 * * 6', scheduledTime: Date.now() });
      const ctx = createExecutionContext();
      server.scheduled(ctrl, env, ctx);

      await waitOnExecutionContext(ctx);

      expect(createSpy).toHaveBeenCalledOnce();
      expect(mockRefreshGitHubStats).not.toHaveBeenCalled();

      createSpy.mockRestore();
    });
  });
});
