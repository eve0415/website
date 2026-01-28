/* oxlint-disable typescript-eslint(no-non-null-assertion), eslint(no-await-in-loop) -- Test assertions verify existence; sequential error type tests require await in loop */
import type { FC } from 'react';

import { RouterProvider, createMemoryHistory, createRootRoute, createRouter } from '@tanstack/react-router';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';

import AftermathScene from './aftermath-scene';

// Create a router wrapper for testing components that use router hooks
const createTestRouter = (visible: boolean) => {
  const rootRoute = createRootRoute({
    component: () => <AftermathScene visible={visible} />,
  });

  return createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: ['/test-page'] }),
  });
};

interface TestWrapperProps {
  visible: boolean;
}

const TestWrapper: FC<TestWrapperProps> = ({ visible }) => {
  const router = createTestRouter(visible);
  return <RouterProvider router={router} />;
};

// Each error type has unique identifiable text that appears immediately (no animation wait)
const ERROR_TYPE_MARKERS = {
  'null-pointer': 'Debug Console - NullPointerException', // Unique header text
  'stack-overflow': 'STACK MONITOR', // Terminal header, appears immediately
  'file-not-found': 'FILE SYSTEM SCHEMATIC', // Header, appears immediately
  'seg-fault': 'MEMORY SEGMENTS', // Label, appears immediately
  'out-of-memory': 'HEAP MEMORY', // Label, appears immediately
  'index-out-of-bounds': '[ARRAY_BOUNDS_ERROR]', // Unique header text
};

// Seed to error type mapping (based on Date.now() / 1000 % 6)
const SEED_TO_TYPE: Record<number, keyof typeof ERROR_TYPE_MARKERS> = {
  0: 'null-pointer',
  1: 'stack-overflow',
  2: 'file-not-found',
  3: 'seg-fault',
  4: 'out-of-memory',
  5: 'index-out-of-bounds',
};

describe('aftermathScene', () => {
  beforeEach(() => {
    vi.spyOn(Date, 'now');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('error selection', () => {
    test.each([
      { seed: 0, expectedType: 'null-pointer' as const },
      { seed: 1, expectedType: 'stack-overflow' as const },
      { seed: 2, expectedType: 'file-not-found' as const },
      { seed: 3, expectedType: 'seg-fault' as const },
      { seed: 4, expectedType: 'out-of-memory' as const },
      { seed: 5, expectedType: 'index-out-of-bounds' as const },
    ])('with seed $seed renders $expectedType component', async ({ seed, expectedType }) => {
      vi.mocked(Date.now).mockReturnValue(seed * 1000);
      await render(<TestWrapper visible />);

      const marker = ERROR_TYPE_MARKERS[expectedType];
      await expect.element(page.getByText(marker)).toBeInTheDocument();
    });
  });

  describe('visibility', () => {
    test('returns null when not visible', async () => {
      vi.mocked(Date.now).mockReturnValue(0);
      await render(<TestWrapper visible={false} />);

      // When not visible, the component renders null
      // Check that no error markers are visible
      const markers = Object.values(ERROR_TYPE_MARKERS);
      for (const marker of markers) await expect.element(page.getByText(marker)).not.toBeInTheDocument();
    });

    test('renders content when visible', async () => {
      vi.mocked(Date.now).mockReturnValue(0);
      await render(<TestWrapper visible />);

      // Should show the null-pointer error (seed 0)
      await expect.element(page.getByText('Debug Console - NullPointerException')).toBeInTheDocument();
    });
  });

  describe('consistency', () => {
    test('error selection is deterministic based on Date.now seed', async () => {
      // Same seed should produce same error type across multiple renders
      vi.mocked(Date.now).mockReturnValue(1000); // seed 1 = stack-overflow

      // First render
      const { unmount } = await render(<TestWrapper visible />);
      await expect.element(page.getByText('STACK MONITOR')).toBeInTheDocument();
      await unmount();

      // Second render with same seed - should show same error
      await render(<TestWrapper visible />);
      await expect.element(page.getByText('STACK MONITOR')).toBeInTheDocument();
    });
  });

  describe('all error types render', () => {
    test('renders all 6 error types with different seeds', async () => {
      const renderedTypes = new Set<string>();

      for (let seed = 0; seed < 6; seed++) {
        vi.mocked(Date.now).mockReturnValue(seed * 1000);
        const { unmount } = await render(<TestWrapper visible />);

        const type = SEED_TO_TYPE[seed];
        const marker = ERROR_TYPE_MARKERS[type!];

        // Check the marker text exists
        try {
          await expect.element(page.getByText(marker)).toBeInTheDocument();
          renderedTypes.add(type!);
        } catch {
          // Marker not found, don't add to set
        }

        await unmount();
      }

      expect(renderedTypes.size).toBe(6);
    });
  });
});
