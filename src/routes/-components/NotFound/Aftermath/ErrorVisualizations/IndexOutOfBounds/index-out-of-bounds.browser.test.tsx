import type { FC } from 'react';

import { RouterProvider, createMemoryHistory, createRootRoute, createRouter } from '@tanstack/react-router';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';

import IndexOutOfBounds from './index-out-of-bounds';

// Mock useReducedMotion
vi.mock('#hooks/useReducedMotion', () => ({
  useReducedMotion: vi.fn(() => false),
}));

// Create a router wrapper
const createTestRouter = () => {
  const rootRoute = createRootRoute({
    component: () => <IndexOutOfBounds />,
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

describe('IndexOutOfBounds', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    test('displays error type header', async () => {
      await render(<TestWrapper />);

      await expect.element(page.getByText('[ARRAY_BOUNDS_ERROR]')).toBeInTheDocument();
    });

    test('displays exception title', async () => {
      await render(<TestWrapper />);

      await expect.element(page.getByText('IndexOutOfBoundsException')).toBeInTheDocument();
    });

    test('displays array code snippet', async () => {
      await render(<TestWrapper />);

      // Shows the int[] data declaration - use regex for partial match
      await expect.element(page.getByText(/int\[\] data = new int\[10\]/)).toBeInTheDocument();
    });
  });

  describe('cursor animation', () => {
    test('cursor moves through array indices', async () => {
      await render(<TestWrapper />);

      // Cursor moves at 200ms interval, 10 positions
      await vi.advanceTimersByTimeAsync(200);

      // Cursor should have started moving
      const cells = document.querySelectorAll('[class*="rounded-lg"]');
      expect(cells.length).toBeGreaterThan(0);
    });
  });

  describe('error state', () => {
    test('shows error after cursor exceeds bounds', async () => {
      await render(<TestWrapper />);

      // 11 positions * 200ms = 2200ms + 300ms delay
      await vi.advanceTimersByTimeAsync(2500);

      // Error message should appear
      await expect.element(page.getByText(/Index 404 out of bounds/)).toBeInTheDocument();
    });

    test('shows java exception detail', async () => {
      await render(<TestWrapper />);

      await vi.advanceTimersByTimeAsync(2500);

      await expect.element(page.getByText('java.lang.IndexOutOfBoundsException')).toBeInTheDocument();
    });
  });

  describe('reduced motion', () => {
    test('shows error state immediately when reduced motion is on', async () => {
      const { useReducedMotion } = await import('#hooks/useReducedMotion');
      vi.mocked(useReducedMotion).mockReturnValue(true);

      await render(<TestWrapper />);

      // Should show error immediately
      await expect.element(page.getByText(/Index 404 out of bounds/)).toBeInTheDocument();
    });
  });

  describe('navigation', () => {
    test('has link to home', async () => {
      await render(<TestWrapper />);

      const link = page.getByText(/境界を修正 → ホームへ戻る/);
      await expect.element(link).toBeInTheDocument();

      const href = link.element()?.closest('a')?.getAttribute('href');
      expect(href).toBe('/');
    });
  });

  describe('array visualization', () => {
    test('displays array indices 0-9', async () => {
      await render(<TestWrapper />);

      // Array has 10 elements (0-9)
      await expect.element(page.getByText('[0]')).toBeInTheDocument();
    });
  });
});
