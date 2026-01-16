import type { FC } from 'react';

import { RouterProvider, createMemoryHistory, createRootRoute, createRouter } from '@tanstack/react-router';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';

import TypeMismatch from './type-mismatch';

const createTestRouter = () => {
  const rootRoute = createRootRoute({
    component: () => <TypeMismatch />,
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

describe('TypeMismatch', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial state', () => {
    test('displays TypeScript header', async () => {
      await render(<TestWrapper />);

      await expect.element(page.getByText('page.tsx - TypeScript Error')).toBeInTheDocument();
    });

    test('displays type system panel', async () => {
      await render(<TestWrapper />);

      await expect.element(page.getByText('Type System - Assignment Check')).toBeInTheDocument();
    });
  });

  describe('animation states', () => {
    test('shows type mismatch error after animation', async () => {
      await render(<TestWrapper />);

      await vi.advanceTimersByTimeAsync(2500);

      await expect.element(page.getByText(/Type 'string' is not assignable to type 'number'/)).toBeInTheDocument();
    });
  });

  describe('navigation', () => {
    test('has link to home', async () => {
      await render(<TestWrapper />);

      const link = page.getByText('型を合わせる → ホームへ戻る');
      await expect.element(link).toBeInTheDocument();

      const href = link.element()?.closest('a')?.getAttribute('href');
      expect(href).toBe('/');
    });
  });
});
