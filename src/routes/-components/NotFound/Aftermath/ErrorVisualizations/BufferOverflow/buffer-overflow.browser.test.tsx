import type { FC } from 'react';

import { RouterProvider, createMemoryHistory, createRootRoute, createRouter } from '@tanstack/react-router';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';

import BufferOverflow from './buffer-overflow';

const createTestRouter = () => {
  const rootRoute = createRootRoute({
    component: () => <BufferOverflow />,
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

describe('BufferOverflow', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial state', () => {
    test('displays GDB header', async () => {
      await render(<TestWrapper />);

      await expect.element(page.getByText('GDB - Stack Smashing Detected')).toBeInTheDocument();
    });

    test('displays stack memory layout', async () => {
      await render(<TestWrapper />);

      await expect.element(page.getByText('Stack Memory Layout (High → Low)')).toBeInTheDocument();
    });
  });

  describe('animation states', () => {
    test('shows canary dead after overflow', async () => {
      await render(<TestWrapper />);

      await vi.advanceTimersByTimeAsync(2500);

      await expect.element(page.getByText('CANARY DEAD')).toBeInTheDocument();
    });

    test('shows stack smashing message', async () => {
      await render(<TestWrapper />);

      await vi.advanceTimersByTimeAsync(2500);

      await expect.element(page.getByText(/stack smashing detected/)).toBeInTheDocument();
    });
  });

  describe('navigation', () => {
    test('has link to home', async () => {
      await render(<TestWrapper />);

      const link = page.getByText('境界チェック → ホームへ戻る');
      await expect.element(link).toBeInTheDocument();

      const href = link.element()?.closest('a')?.getAttribute('href');
      expect(href).toBe('/');
    });
  });
});
