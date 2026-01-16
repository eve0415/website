import type { FC } from 'react';

import { RouterProvider, createMemoryHistory, createRootRoute, createRouter } from '@tanstack/react-router';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';

import TypeError from './type-error';

const createTestRouter = () => {
  const rootRoute = createRootRoute({
    component: () => <TypeError />,
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

describe('TypeError', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial state', () => {
    test('displays Console header', async () => {
      await render(<TestWrapper />);

      await expect.element(page.getByText('Console - TypeError')).toBeInTheDocument();
    });

    test('displays object graph panel', async () => {
      await render(<TestWrapper />);

      await expect.element(page.getByText('Object Graph - Property Access Path')).toBeInTheDocument();
    });
  });

  describe('animation states', () => {
    test('shows type error after path traversal', async () => {
      await render(<TestWrapper />);

      await vi.advanceTimersByTimeAsync(2500);

      await expect.element(page.getByText(/Uncaught TypeError: Cannot read properties of undefined/)).toBeInTheDocument();
    });
  });

  describe('navigation', () => {
    test('has link to home', async () => {
      await render(<TestWrapper />);

      const link = page.getByText('型を検証 → ホームへ戻る');
      await expect.element(link).toBeInTheDocument();

      const href = link.element()?.closest('a')?.getAttribute('href');
      expect(href).toBe('/');
    });
  });
});
