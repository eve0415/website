import { createRouterHarness } from '@tanstack-router-testing/react-router-testing';
import { createRootRoute } from '@tanstack/react-router';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vite-plus/test';
import { page } from 'vite-plus/test/browser';
import { render } from 'vitest-browser-react';

import NotFound from './not-found';

vi.mock('#hooks/useReducedMotion', () => ({
  useReducedMotion: vi.fn(() => false),
}));

vi.mock('./BootSequence/connection-info', () => ({
  // oxlint-disable-next-line typescript/require-await -- Mock async function for testing
  getConnectionInfo: vi.fn(async () => ({
    serverIp: '127.0.0.1',
    tlsVersion: 'TLSv1.3',
    tlsCipher: 'TLS_AES_128_GCM_SHA256',
    httpVersion: 'h2',
    cfRay: 'mock-ray-id',
    colo: 'NRT',
    certificatePack: undefined,
  })),
}));

const createHarness = () =>
  createRouterHarness({
    routeTree: createRootRoute({ component: () => <NotFound /> }),
    initialEntries: ['/not-found'],
  });

describe('notFound', () => {
  let harness: ReturnType<typeof createHarness>;

  beforeEach(() => {
    vi.useFakeTimers();
    harness = createHarness();
  });

  afterEach(() => {
    harness.cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('accessibility', () => {
    test('has aria-label on main element', async () => {
      await render(<harness.TestRouterProvider />);

      const main = document.querySelector('main');
      expect(main?.getAttribute('aria-label')).toBe('ページが見つかりません');
    });

    test('has screen reader content', async () => {
      await render(<harness.TestRouterProvider />);

      // Screen reader only content
      const srContent = document.querySelector('.sr-only');
      expect(srContent?.textContent).toContain('ページが見つかりません');
    });
  });

  describe('boot phase', () => {
    test('renders BootSequence in boot phase', async () => {
      await render(<harness.TestRouterProvider />);

      // Boot sequence should be visible initially
      // Look for boot-related content (terminal style messages)
      await expect
        .poll(() => {
          const content = document.body.textContent;
          return content !== '';
        })
        .toBe(true);
    });
  });

  describe('reduced motion', () => {
    test('renders StaticAftermath immediately when reduced motion is on', async () => {
      const { useReducedMotion } = await import('#hooks/useReducedMotion');
      vi.mocked(useReducedMotion).mockReturnValue(true);

      await render(<harness.TestRouterProvider />);

      // Should show 404 text in the large heading - verify via DOM query
      const heading404 = document.querySelector('.text-8xl');
      expect(heading404?.textContent).toBe('404');
    });

    test('shows error contained message with reduced motion', async () => {
      const { useReducedMotion } = await import('#hooks/useReducedMotion');
      vi.mocked(useReducedMotion).mockReturnValue(true);

      await render(<harness.TestRouterProvider />);

      await expect.element(page.getByText('[ERROR_CONTAINED]')).toBeInTheDocument();
    });

    test('has link to home with reduced motion', async () => {
      const { useReducedMotion } = await import('#hooks/useReducedMotion');
      vi.mocked(useReducedMotion).mockReturnValue(true);

      await render(<harness.TestRouterProvider />);

      // Use exact match to find the link text specifically (not the sr-only content)
      const link = page.getByText('ホームに戻る', { exact: true });
      await expect.element(link).toBeInTheDocument();

      const href = link.element()?.closest('a')?.getAttribute('href');
      expect(href).toBe('/');
    });

    test('shows Japanese message with reduced motion', async () => {
      const { useReducedMotion } = await import('#hooks/useReducedMotion');
      vi.mocked(useReducedMotion).mockReturnValue(true);

      await render(<harness.TestRouterProvider />);

      await expect.element(page.getByText('次元境界に異常が発生しました')).toBeInTheDocument();
    });
  });

  describe('staticAftermath component', () => {
    test('has visual indicator dot', async () => {
      const { useReducedMotion } = await import('#hooks/useReducedMotion');
      vi.mocked(useReducedMotion).mockReturnValue(true);

      await render(<harness.TestRouterProvider />);

      // Check for the green dot indicator
      const dots = document.querySelectorAll('.rounded-full.bg-neon');
      expect(dots.length).toBeGreaterThan(0);
    });
  });
});
