import type { FC } from 'react';

import { RouterProvider, createMemoryHistory, createRootRoute, createRouter } from '@tanstack/react-router';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';

import TimeoutError from './timeout-error';

const createTestRouter = () => {
  const rootRoute = createRootRoute({
    component: () => <TimeoutError />,
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

describe('TimeoutError', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial state', () => {
    test('displays Go terminal header', async () => {
      await render(<TestWrapper />);

      await expect.element(page.getByText('go run server.go - context deadline exceeded')).toBeInTheDocument();
    });

    test('displays hourglass timer', async () => {
      await render(<TestWrapper />);

      await expect.element(page.getByText('context.WithTimeout(30s)')).toBeInTheDocument();
    });

    test('displays request progress', async () => {
      await render(<TestWrapper />);

      await expect.element(page.getByText('Request Progress')).toBeInTheDocument();
    });
  });

  describe('animation states', () => {
    test('shows timeout after countdown', async () => {
      await render(<TestWrapper />);

      await vi.advanceTimersByTimeAsync(3500);

      await expect.element(page.getByText('TIMEOUT', { exact: true })).toBeInTheDocument();
    });

    test('shows deadline exceeded message', async () => {
      await render(<TestWrapper />);

      await vi.advanceTimersByTimeAsync(3500);

      await expect.element(page.getByText('error: context deadline exceeded')).toBeInTheDocument();
    });
  });

  describe('navigation', () => {
    test('has link to home', async () => {
      await render(<TestWrapper />);

      const link = page.getByText('タイムアウト延長 → ホームへ戻る');
      await expect.element(link).toBeInTheDocument();

      const href = link.element()?.closest('a')?.getAttribute('href');
      expect(href).toBe('/');
    });
  });
});
