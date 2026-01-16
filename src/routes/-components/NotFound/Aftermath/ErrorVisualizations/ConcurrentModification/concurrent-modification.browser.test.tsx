import type { FC } from 'react';

import { RouterProvider, createMemoryHistory, createRootRoute, createRouter } from '@tanstack/react-router';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';

import ConcurrentModification from './concurrent-modification';

const createTestRouter = () => {
  const rootRoute = createRootRoute({
    component: () => <ConcurrentModification />,
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

describe('ConcurrentModification', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial state', () => {
    test('displays Java concurrency header', async () => {
      await render(<TestWrapper />);

      await expect.element(page.getByText('Java - ConcurrentModificationException')).toBeInTheDocument();
    });

    test('displays thread visualization', async () => {
      await render(<TestWrapper />);

      await expect.element(page.getByText('Reader Thread')).toBeInTheDocument();
      await expect.element(page.getByText('Writer Thread')).toBeInTheDocument();
    });

    test('displays ArrayList visualization', async () => {
      await render(<TestWrapper />);

      await expect.element(page.getByText('ArrayList<Page> pages')).toBeInTheDocument();
    });
  });

  describe('animation states', () => {
    test('shows modCount after threads conflict', async () => {
      await render(<TestWrapper />);

      await vi.advanceTimersByTimeAsync(4000);

      // The component shows modCount display (exact match to avoid expectedModCount)
      await expect.element(page.getByText('modCount', { exact: true })).toBeInTheDocument();
    });

    test('shows exception message', async () => {
      await render(<TestWrapper />);

      await vi.advanceTimersByTimeAsync(4000);

      // Look for the specific error text shown when crashed
      await expect.element(page.getByText('ConcurrentModificationException', { exact: true })).toBeInTheDocument();
    });
  });

  describe('navigation', () => {
    test('has link to home', async () => {
      await render(<TestWrapper />);

      const link = page.getByText('同期を取る → ホームへ戻る');
      await expect.element(link).toBeInTheDocument();

      const href = link.element()?.closest('a')?.getAttribute('href');
      expect(href).toBe('/');
    });
  });
});
