import type { FC } from 'react';

import { RouterProvider, createMemoryHistory, createRootRoute, createRouter } from '@tanstack/react-router';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';

import OutOfMemory from './out-of-memory';

// Mock useReducedMotion
vi.mock('#hooks/useReducedMotion', () => ({
  useReducedMotion: vi.fn(() => false),
}));

// Create a router wrapper
const createTestRouter = () => {
  const rootRoute = createRootRoute({
    component: () => <OutOfMemory />,
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

describe('OutOfMemory', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    test('displays title', async () => {
      await render(<TestWrapper />);

      await expect.element(page.getByText('OUT OF MEMORY')).toBeInTheDocument();
    });

    test('displays subtitle', async () => {
      await render(<TestWrapper />);

      await expect.element(page.getByText('Heap allocation failed')).toBeInTheDocument();
    });

    test('displays heap memory section', async () => {
      await render(<TestWrapper />);

      await expect.element(page.getByText('HEAP MEMORY')).toBeInTheDocument();
    });

    test('displays memory stats labels', async () => {
      await render(<TestWrapper />);

      await expect.element(page.getByText('USED')).toBeInTheDocument();
      await expect.element(page.getByText('FREE')).toBeInTheDocument();
      await expect.element(page.getByText('OBJECTS')).toBeInTheDocument();
    });

    test('starts with 50 initial particles', async () => {
      await render(<TestWrapper />);

      // Objects count should show 50 initially
      await expect.element(page.getByText('50')).toBeInTheDocument();
    });
  });

  describe('memory fill animation', () => {
    test('memory increases over time', async () => {
      await render(<TestWrapper />);

      // Initially at 0%
      await expect.element(page.getByText('0%')).toBeInTheDocument();

      // Advance time (80ms per 2% increase)
      await vi.advanceTimersByTimeAsync(400); // ~10%

      // Memory should have increased
      await expect
        .poll(() => {
          const percentText = document.body.textContent;
          return percentText?.includes('0%') === false;
        })
        .toBe(true);
    });

    test('caps at 100%', async () => {
      await render(<TestWrapper />);

      // Advance enough time to fill memory (50 intervals * 80ms = 4000ms)
      await vi.advanceTimersByTimeAsync(5000);

      await expect.element(page.getByText('100%')).toBeInTheDocument();
    });
  });

  describe('overflow state', () => {
    test('shows fatal error message when overflow', async () => {
      await render(<TestWrapper />);

      // Advance to trigger overflow
      await vi.advanceTimersByTimeAsync(5000);

      await expect.element(page.getByText(/FATAL ERROR: Allocation failed/)).toBeInTheDocument();
    });
  });

  describe('reduced motion', () => {
    test('starts at 100% when reduced motion is on', async () => {
      const { useReducedMotion } = await import('#hooks/useReducedMotion');
      vi.mocked(useReducedMotion).mockReturnValue(true);

      await render(<TestWrapper />);

      await expect.element(page.getByText('100%')).toBeInTheDocument();
      await expect.element(page.getByText(/FATAL ERROR/)).toBeInTheDocument();
    });
  });

  describe('navigation', () => {
    test('has link to home', async () => {
      await render(<TestWrapper />);

      const link = page.getByText('メモリを解放 → ホームへ戻る');
      await expect.element(link).toBeInTheDocument();

      const href = link.element()?.closest('a')?.getAttribute('href');
      expect(href).toBe('/');
    });
  });
});
