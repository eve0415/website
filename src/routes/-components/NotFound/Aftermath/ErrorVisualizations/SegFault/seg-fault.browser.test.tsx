import type { FC } from 'react';

import { RouterProvider, createMemoryHistory, createRootRoute, createRouter } from '@tanstack/react-router';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';

import SegFault from './seg-fault';

// Mock useReducedMotion
vi.mock('#hooks/useReducedMotion', () => ({
  useReducedMotion: vi.fn(() => false),
}));

// Create a router wrapper
const createTestRouter = () => {
  const rootRoute = createRootRoute({
    component: () => <SegFault />,
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

describe('SegFault', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    test('displays SEGFAULT title', async () => {
      await render(<TestWrapper />);

      // SEGFAULT appears twice due to glitch effect - use getAllByText
      const elements = page.getByText('SEGFAULT').elements();
      expect(elements.length).toBeGreaterThan(0);
    });

    test('displays memory segments section', async () => {
      await render(<TestWrapper />);

      await expect.element(page.getByText('MEMORY SEGMENTS')).toBeInTheDocument();
    });

    test('displays all memory segment names', async () => {
      await render(<TestWrapper />);

      await expect.element(page.getByText('TEXT')).toBeInTheDocument();
      await expect.element(page.getByText('DATA')).toBeInTheDocument();
      await expect.element(page.getByText('HEAP')).toBeInTheDocument();
      await expect.element(page.getByText('STACK')).toBeInTheDocument();
    });

    test('displays violation indicator on invalid segment', async () => {
      await render(<TestWrapper />);

      await expect.element(page.getByText('VIOLATION')).toBeInTheDocument();
    });

    test('displays memory segment addresses', async () => {
      await render(<TestWrapper />);

      // TEXT segment address
      await expect.element(page.getByText(/0x00400000/)).toBeInTheDocument();
    });

    test('displays permissions', async () => {
      await render(<TestWrapper />);

      // r-x appears once (TEXT segment), --- appears once (invalid segment)
      await expect.element(page.getByText('r-x')).toBeInTheDocument();
      await expect.element(page.getByText('---')).toBeInTheDocument();

      // rw- appears 3 times (DATA, HEAP, STACK) - verify at least one exists
      const rwElements = page.getByText('rw-').elements();
      expect(rwElements.length).toBeGreaterThan(0);
    });
  });

  describe('core dump message', () => {
    test('shows core dump after 1500ms', async () => {
      await render(<TestWrapper />);

      // Initially no core dump
      await expect.element(page.getByText('Segmentation fault (core dumped)')).not.toBeInTheDocument();

      // Advance time to show core dump
      await vi.advanceTimersByTimeAsync(1500);

      await expect.element(page.getByText('Segmentation fault (core dumped)')).toBeInTheDocument();
    });

    test('shows signal information with core dump', async () => {
      await render(<TestWrapper />);

      await vi.advanceTimersByTimeAsync(1500);

      // Use more specific regex that matches the full signal line
      await expect.element(page.getByText(/Signal 11 \(SIGSEGV\) at address/)).toBeInTheDocument();
    });
  });

  describe('reduced motion', () => {
    test('shows core dump immediately when reduced motion is on', async () => {
      const { useReducedMotion } = await import('#hooks/useReducedMotion');
      vi.mocked(useReducedMotion).mockReturnValue(true);

      await render(<TestWrapper />);

      await expect.element(page.getByText('Segmentation fault (core dumped)')).toBeInTheDocument();
    });
  });

  describe('navigation', () => {
    test('has link to home', async () => {
      await render(<TestWrapper />);

      const link = page.getByText('メモリを修復 → ホームへ戻る');
      await expect.element(link).toBeInTheDocument();

      const href = link.element()?.closest('a')?.getAttribute('href');
      expect(href).toBe('/');
    });
  });
});
