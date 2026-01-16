import type { FC } from 'react';

import { RouterProvider, createMemoryHistory, createRootRoute, createRouter } from '@tanstack/react-router';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';

import AssertionError from './assertion-error';

const createTestRouter = () => {
  const rootRoute = createRootRoute({
    component: () => <AssertionError />,
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

describe('AssertionError', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial state', () => {
    test('displays pytest header', async () => {
      await render(<TestWrapper />);

      await expect.element(page.getByText('pytest - AssertionError')).toBeInTheDocument();
    });

    test('displays test progress', async () => {
      await render(<TestWrapper />);

      await expect.element(page.getByText('Running tests...')).toBeInTheDocument();
    });

    test('displays test output panel', async () => {
      await render(<TestWrapper />);

      await expect.element(page.getByText('Test Output')).toBeInTheDocument();
    });
  });

  describe('animation states', () => {
    test('shows test execution', async () => {
      await render(<TestWrapper />);

      await vi.advanceTimersByTimeAsync(2500);

      // Should show some passed tests
      await expect.element(page.getByText(/passed/)).toBeInTheDocument();
    });

    test('shows failed test details after failure', async () => {
      await render(<TestWrapper />);

      await vi.advanceTimersByTimeAsync(3500);

      await expect.element(page.getByText('FAILED test_page_returns_200')).toBeInTheDocument();
    });

    test('shows expected vs actual comparison', async () => {
      await render(<TestWrapper />);

      await vi.advanceTimersByTimeAsync(3500);

      await expect.element(page.getByText('Expected')).toBeInTheDocument();
      await expect.element(page.getByText('Actual')).toBeInTheDocument();
    });
  });

  describe('navigation', () => {
    test('has link to home', async () => {
      await render(<TestWrapper />);

      const link = page.getByText('テストを修正 → ホームへ戻る');
      await expect.element(link).toBeInTheDocument();

      const href = link.element()?.closest('a')?.getAttribute('href');
      expect(href).toBe('/');
    });
  });
});
