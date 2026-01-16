import type { FC } from 'react';

import { RouterProvider, createMemoryHistory, createRootRoute, createRouter } from '@tanstack/react-router';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';

import DivisionByZero from './division-by-zero';

const createTestRouter = () => {
  const rootRoute = createRootRoute({
    component: () => <DivisionByZero />,
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

describe('DivisionByZero', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial state', () => {
    test('displays Python header', async () => {
      await render(<TestWrapper />);

      await expect.element(page.getByText('Python 3.12.0 - ZeroDivisionError')).toBeInTheDocument();
    });

    test('displays the division symbol and zero', async () => {
      await render(<TestWrapper />);

      await expect.element(page.getByText('÷')).toBeInTheDocument();
      await expect.element(page.getByText('0', { exact: true }).first()).toBeInTheDocument();
    });
  });

  describe('animation states', () => {
    test('shows error message', async () => {
      await render(<TestWrapper />);

      await expect.element(page.getByText('ZeroDivisionError: division by zero')).toBeInTheDocument();
    });

    test('shows beyond infinity message after collapse', async () => {
      await render(<TestWrapper />);

      await vi.advanceTimersByTimeAsync(3000);

      await expect.element(page.getByText('beyond infinity')).toBeInTheDocument();
    });
  });

  describe('navigation', () => {
    test('has link to home', async () => {
      await render(<TestWrapper />);

      const link = page.getByText('ゼロを回避 → ホームへ戻る');
      await expect.element(link).toBeInTheDocument();

      const href = link.element()?.closest('a')?.getAttribute('href');
      expect(href).toBe('/');
    });
  });
});
