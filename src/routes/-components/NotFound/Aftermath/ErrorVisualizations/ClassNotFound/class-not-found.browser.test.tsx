import type { FC } from 'react';

import { RouterProvider, createMemoryHistory, createRootRoute, createRouter } from '@tanstack/react-router';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';

import ClassNotFound from './class-not-found';

const createTestRouter = () => {
  const rootRoute = createRootRoute({
    component: () => <ClassNotFound />,
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

describe('ClassNotFound', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial state', () => {
    test('displays Java ClassLoader header', async () => {
      await render(<TestWrapper />);

      await expect.element(page.getByText('Java ClassLoader - ClassNotFoundException')).toBeInTheDocument();
    });

    test('displays class hierarchy search', async () => {
      await render(<TestWrapper />);

      await expect.element(page.getByText('Class Hierarchy Search')).toBeInTheDocument();
    });

    test('displays classpath entries', async () => {
      await render(<TestWrapper />);

      await expect.element(page.getByText('Classpath Entries:')).toBeInTheDocument();
    });
  });

  describe('animation states', () => {
    test('shows search progress', async () => {
      await render(<TestWrapper />);

      await vi.advanceTimersByTimeAsync(2500);

      // Should show scanning progress (multiple elements, use first)
      await expect.element(page.getByText(/Scanning:/).first()).toBeInTheDocument();
    });

    test('shows exception after search complete', async () => {
      await render(<TestWrapper />);

      await vi.advanceTimersByTimeAsync(5000);

      await expect.element(page.getByText('java.lang.ClassNotFoundException: Page')).toBeInTheDocument();
    });
  });

  describe('navigation', () => {
    test('has link to home', async () => {
      await render(<TestWrapper />);

      const link = page.getByText('クラスを探す → ホームへ戻る');
      await expect.element(link).toBeInTheDocument();

      const href = link.element()?.closest('a')?.getAttribute('href');
      expect(href).toBe('/');
    });
  });
});
