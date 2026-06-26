import { createRouterHarness } from '@tanstack-router-testing/react-router-testing';
import { createRootRoute } from '@tanstack/react-router';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';

import NotFound from './not-found';

vi.mock('#hooks/useReducedMotion', () => ({
  useReducedMotion: vi.fn(() => false),
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

      // Both the always-on sr-only link and the visible aftermath link share
      // the accessible name "ホームに戻る" - every one must point home
      const homeLinks = page.getByRole('link', { name: 'ホームに戻る' });
      await expect.element(homeLinks.first()).toBeInTheDocument();

      const hrefs = homeLinks.elements().map(el => el.closest('a')?.getAttribute('href'));
      expect(hrefs.length).toBeGreaterThanOrEqual(2);
      for (const href of hrefs) expect(href).toBe('/');
    });

    test('exposes an sr-only home link immediately, independent of animation', async () => {
      // Default mock: reduced motion OFF, so the visible aftermath link is NOT
      // rendered yet - only the always-on sr-only link should be present
      await render(<harness.TestRouterProvider />);

      const homeLink = page.getByRole('link', { name: 'ホームに戻る' });
      await expect.element(homeLink).toBeInTheDocument();
      expect(homeLink.element().closest('a')?.getAttribute('href')).toBe('/');
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
