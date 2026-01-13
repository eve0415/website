import type { FC } from 'react';

import { RouterProvider, createMemoryHistory, createRootRoute, createRouter } from '@tanstack/react-router';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';

import StackOverflow from './stack-overflow';

// Mock useReducedMotion
vi.mock('#hooks/useReducedMotion', () => ({
  useReducedMotion: vi.fn(() => false),
}));

// Create a router wrapper
const createTestRouter = () => {
  const rootRoute = createRootRoute({
    component: () => <StackOverflow />,
  });

  return createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: ['/error'] }),
  });
};

const TestWrapper: FC = () => {
  const router = createTestRouter();
  return <RouterProvider router={router} />;
};

describe('StackOverflow', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    test('displays terminal header', async () => {
      await render(<TestWrapper />);

      await expect.element(page.getByText('STACK MONITOR v1.0')).toBeInTheDocument();
    });

    test('displays monitoring status initially', async () => {
      await render(<TestWrapper />);

      await expect.element(page.getByText('MONITORING...')).toBeInTheDocument();
    });

    test('displays stack bottom marker', async () => {
      await render(<TestWrapper />);

      await expect.element(page.getByText('─── STACK BOTTOM ───')).toBeInTheDocument();
    });

    test('displays stack memory label', async () => {
      await render(<TestWrapper />);

      await expect.element(page.getByText('STACK MEMORY')).toBeInTheDocument();
    });
  });

  describe('stack frame animation', () => {
    test('adds stack frames over time', async () => {
      await render(<TestWrapper />);

      // Initially no frames visible (animation hasn't started)
      await vi.advanceTimersByTimeAsync(100);

      // First frame should appear
      await expect.element(page.getByText(/recurse\(n=404\)/)).toBeInTheDocument();
    });

    test('shows multiple frames after time passes', async () => {
      await render(<TestWrapper />);

      // Advance through multiple frames (100ms each)
      await vi.advanceTimersByTimeAsync(500);

      // Multiple frames should be visible
      await expect.element(page.getByText(/recurse\(n=404\)/)).toBeInTheDocument();
    });
  });

  describe('overflow state', () => {
    test('shows overflow message after all frames', async () => {
      await render(<TestWrapper />);

      // 18 frames * 100ms = 1800ms, then overflow shows
      await vi.advanceTimersByTimeAsync(2000);

      await expect.element(page.getByText('STACK OVERFLOW')).toBeInTheDocument();
    });

    test('shows overflow detected in header', async () => {
      await render(<TestWrapper />);

      // 18 frames * 100ms = 1800ms, then +800ms for setCrashed = 2600ms total
      await vi.advanceTimersByTimeAsync(2700);

      // Use regex for the overflow detection message in header
      await expect.element(page.getByText(/OVERFLOW DETECTED/)).toBeInTheDocument();
    });

    test('shows maximum call stack message', async () => {
      await render(<TestWrapper />);

      await vi.advanceTimersByTimeAsync(2000);

      await expect.element(page.getByText('Maximum call stack size exceeded')).toBeInTheDocument();
    });
  });

  describe('memory percentage', () => {
    test('shows 100% at crash', async () => {
      await render(<TestWrapper />);

      // Advance past crash (overflow + 800ms for crashed state)
      await vi.advanceTimersByTimeAsync(3000);

      await expect.element(page.getByText('100%')).toBeInTheDocument();
    });
  });

  describe('reduced motion', () => {
    test('shows all frames immediately when reduced motion is on', async () => {
      const { useReducedMotion } = await import('#hooks/useReducedMotion');
      vi.mocked(useReducedMotion).mockReturnValue(true);

      await render(<TestWrapper />);

      // Should show overflow immediately
      await expect.element(page.getByText('STACK OVERFLOW')).toBeInTheDocument();
      // Should show main() frame
      await expect.element(page.getByText(/main\(\)/)).toBeInTheDocument();
    });
  });

  describe('navigation', () => {
    test('has link to home', async () => {
      await render(<TestWrapper />);

      const link = page.getByText('> スタックをクリア && ホームへ戻る_');
      await expect.element(link).toBeInTheDocument();

      const href = link.element()?.closest('a')?.getAttribute('href');
      expect(href).toBe('/');
    });
  });
});
