import type { FC } from 'react';

import { RouterProvider, createMemoryHistory, createRootRoute, createRouter } from '@tanstack/react-router';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';

import UndefinedBehavior from './undefined-behavior';

const createTestRouter = () => {
  const rootRoute = createRootRoute({
    component: () => <UndefinedBehavior />,
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

describe('UndefinedBehavior', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial state', () => {
    test('displays C terminal header', async () => {
      await render(<TestWrapper />);

      await expect.element(page.getByText('undefined_behavior.c - Nasal Demons Territory')).toBeInTheDocument();
    });

    test('displays compiler warning', async () => {
      await render(<TestWrapper />);

      await expect.element(page.getByText(/variable 'x' is uninitialized/)).toBeInTheDocument();
    });
  });

  describe('animation states', () => {
    test('shows multiple outputs after animation', async () => {
      await render(<TestWrapper />);

      await vi.advanceTimersByTimeAsync(4000);

      // Multiple different outputs from same code
      await expect.element(page.getByText('gcc -O0')).toBeInTheDocument();
    });

    test('shows nasal demons after all outputs', async () => {
      await render(<TestWrapper />);

      await vi.advanceTimersByTimeAsync(5000);

      await expect.element(page.getByText('NASAL DEMONS RELEASED')).toBeInTheDocument();
    });
  });

  describe('navigation', () => {
    test('has link to home', async () => {
      await render(<TestWrapper />);

      const link = page.getByText('未定義を回避 → ホームへ戻る');
      await expect.element(link).toBeInTheDocument();

      const href = link.element()?.closest('a')?.getAttribute('href');
      expect(href).toBe('/');
    });
  });
});
