import type { FC } from 'react';

import { RouterProvider, createMemoryHistory, createRootRoute, createRouter } from '@tanstack/react-router';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';

import SyntaxError from './syntax-error';

const createTestRouter = () => {
  const rootRoute = createRootRoute({
    component: () => <SyntaxError />,
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

describe('SyntaxError', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial state', () => {
    test('displays VS Code header', async () => {
      await render(<TestWrapper />);

      await expect.element(page.getByText('page.tsx - SyntaxError')).toBeInTheDocument();
    });

    test('displays problems panel', async () => {
      await render(<TestWrapper />);

      await expect.element(page.getByText('PROBLEMS')).toBeInTheDocument();
    });
  });

  describe('animation states', () => {
    test('shows syntax error after typing animation', async () => {
      await render(<TestWrapper />);

      await vi.advanceTimersByTimeAsync(2000);

      await expect.element(page.getByText(/SyntaxError: Unexpected token/)).toBeInTheDocument();
    });
  });

  describe('navigation', () => {
    test('has link to home', async () => {
      await render(<TestWrapper />);

      const link = page.getByText('構文を修正 → ホームへ戻る');
      await expect.element(link).toBeInTheDocument();

      const href = link.element()?.closest('a')?.getAttribute('href');
      expect(href).toBe('/');
    });
  });
});
