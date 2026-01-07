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

  test('exports fetch handler', () => {
    expect(server.fetch).toBeDefined();
    expect(typeof server.fetch).toBe('function');
  });

  test('exports scheduled handler', () => {
    expect(server.scheduled).toBeDefined();
    expect(typeof server.scheduled).toBe('function');
  });

  describe('scheduled handler', () => {
    test('calls refreshGitHubStats with env and ctx.waitUntil receives the promise', async () => {
      const mockWaitUntil = vi.fn();
      const mockCtx = { waitUntil: mockWaitUntil };
      const mockEvent = { cron: '0 * * * *', scheduledTime: Date.now() };
      const mockEnv = { GITHUB_PAT: 'test-token', GITHUB_STATS_CACHE: {} };

      await server.scheduled(
        mockEvent as unknown as Parameters<typeof server.scheduled>[0],
        mockEnv as unknown as Parameters<typeof server.scheduled>[1],
        mockCtx as unknown as Parameters<typeof server.scheduled>[2],
      );

      expect(mockWaitUntil).toHaveBeenCalledTimes(1);
      expect(refreshGitHubStats).toHaveBeenCalledWith(mockEnv);
    });
  });
});
