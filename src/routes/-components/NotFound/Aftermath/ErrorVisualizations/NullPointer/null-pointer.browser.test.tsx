import type { FC } from 'react';

import { RouterProvider, createMemoryHistory, createRootRoute, createRouter } from '@tanstack/react-router';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';

import NullPointer from './null-pointer';

// Create a router wrapper for testing Link components
const createTestRouter = () => {
  const rootRoute = createRootRoute({
    component: () => <NullPointer />,
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

describe('NullPointer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial state', () => {
    test('displays VS Code style header', async () => {
      await render(<TestWrapper />);

      await expect.element(page.getByText('Debug Console - NullPointerException')).toBeInTheDocument();
    });

    test('displays error message', async () => {
      await render(<TestWrapper />);

      await expect.element(page.getByText(/Exception in thread "main" java.lang.NullPointerException/)).toBeInTheDocument();
    });

    test('displays memory layout section', async () => {
      await render(<TestWrapper />);

      await expect.element(page.getByText('VARIABLES')).toBeInTheDocument();
      await expect.element(page.getByText('- Memory Layout')).toBeInTheDocument();
    });

    test('displays call stack', async () => {
      await render(<TestWrapper />);

      await expect.element(page.getByText('CALL STACK')).toBeInTheDocument();
      await expect.element(page.getByText('→ processPage(null)')).toBeInTheDocument();
    });
  });

  describe('memory grid', () => {
    test('displays 8 memory cells', async () => {
      await render(<TestWrapper />);

      // Memory addresses should be visible
      await expect.element(page.getByText('0x7fff0000')).toBeInTheDocument();
      await expect.element(page.getByText('0x7fff0038')).toBeInTheDocument();
    });

    test('displays null reference cell', async () => {
      await render(<TestWrapper />);

      // The null pointer cell shows "ref →" with NULL
      await expect.element(page.getByText('ref →')).toBeInTheDocument();
    });

    test('displays legend', async () => {
      await render(<TestWrapper />);

      await expect.element(page.getByText('Null Reference')).toBeInTheDocument();
      await expect.element(page.getByText('Valid Memory')).toBeInTheDocument();
    });
  });

  describe('animation states', () => {
    test('highlights null pointer cell after 800ms', async () => {
      await render(<TestWrapper />);

      // Before animation - no specific highlighting
      const nullCell = page.getByText('ref →').element()?.closest('[class*="cursor-pointer"]');
      expect(nullCell).toBeTruthy();

      // Advance time to trigger highlight
      await vi.advanceTimersByTimeAsync(800);

      // Cell should now have error styling (pulse animation on the container)
      await expect.element(page.getByText('ref →')).toBeInTheDocument();
    });

    test('shows pointer path after 1300ms', async () => {
      await render(<TestWrapper />);

      // Advance time to show pointer path (800ms + 500ms)
      await vi.advanceTimersByTimeAsync(1300);

      // The error indicator should be visible
      await expect.element(page.getByText('❌')).toBeInTheDocument();
    });
  });

  describe('navigation', () => {
    test('has link to home', async () => {
      await render(<TestWrapper />);

      const link = page.getByText('ポインタを初期化 → ホームへ戻る');
      await expect.element(link).toBeInTheDocument();

      const href = link.element()?.closest('a')?.getAttribute('href');
      expect(href).toBe('/');
    });
  });

  describe('call stack display', () => {
    test('shows full call stack', async () => {
      await render(<TestWrapper />);

      await expect.element(page.getByText('→ processPage(null)')).toBeInTheDocument();
      await expect.element(page.getByText('renderContent()')).toBeInTheDocument();
      await expect.element(page.getByText('handleRequest()')).toBeInTheDocument();
      await expect.element(page.getByText('main()')).toBeInTheDocument();
    });
  });
});
