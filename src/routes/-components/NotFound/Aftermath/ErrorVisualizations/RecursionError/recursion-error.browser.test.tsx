import type { FC } from 'react';

import { RouterProvider, createMemoryHistory, createRootRoute, createRouter } from '@tanstack/react-router';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';

import RecursionError from './recursion-error';

const createTestRouter = () => {
  const rootRoute = createRootRoute({
    component: () => <RecursionError />,
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

describe('RecursionError', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial state', () => {
    test('displays Python header', async () => {
      await render(<TestWrapper />);

      await expect.element(page.getByText('Python 3.12.0 - RecursionError')).toBeInTheDocument();
    });

    test('displays traceback panel', async () => {
      await render(<TestWrapper />);

      await expect.element(page.getByText('Traceback (most recent call last):')).toBeInTheDocument();
    });
  });

  describe('animation states', () => {
    test('shows fractal visualization', async () => {
      await render(<TestWrapper />);

      await expect.element(page.getByText('Recursion Depth')).toBeInTheDocument();
    });

    test('shows error after max depth', async () => {
      await render(<TestWrapper />);

      await vi.advanceTimersByTimeAsync(4000);

      await expect.element(page.getByText('RecursionError: maximum recursion depth exceeded')).toBeInTheDocument();
    });
  });

  describe('navigation', () => {
    test('has link to home', async () => {
      await render(<TestWrapper />);

      const link = page.getByText('再帰を終了 → ホームへ戻る');
      await expect.element(link).toBeInTheDocument();

      const href = link.element()?.closest('a')?.getAttribute('href');
      expect(href).toBe('/');
    });
  });
});
