import type { FC } from 'react';

import { RouterProvider, createMemoryHistory, createRootRoute, createRouter } from '@tanstack/react-router';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';

import Panic from './panic';

const createTestRouter = () => {
  const rootRoute = createRootRoute({
    component: () => <Panic />,
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

describe('Panic', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial state', () => {
    test('displays Go terminal header', async () => {
      await render(<TestWrapper />);

      await expect.element(page.getByText('go run page.go')).toBeInTheDocument();
    });
  });

  describe('animation states', () => {
    test('shows panic message after 500ms', async () => {
      await render(<TestWrapper />);

      await vi.advanceTimersByTimeAsync(600);

      await expect.element(page.getByText(/panic: runtime error/)).toBeInTheDocument();
    });

    test('shows stack frames after panic', async () => {
      await render(<TestWrapper />);

      await vi.advanceTimersByTimeAsync(2500);

      await expect.element(page.getByText(/main.handleRequest/)).toBeInTheDocument();
    });

    test('shows gopher image after panic', async () => {
      await render(<TestWrapper />);

      await vi.advanceTimersByTimeAsync(600);

      await expect.element(page.getByAltText('Go Gopher panicking')).toBeInTheDocument();
    });
  });

  describe('navigation', () => {
    test('has link to home', async () => {
      await render(<TestWrapper />);

      const link = page.getByText('recover() → ホームへ戻る');
      await expect.element(link).toBeInTheDocument();

      const href = link.element()?.closest('a')?.getAttribute('href');
      expect(href).toBe('/');
    });
  });
});
