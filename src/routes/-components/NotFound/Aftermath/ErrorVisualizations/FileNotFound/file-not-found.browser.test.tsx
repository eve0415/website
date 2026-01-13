import type { FC } from 'react';

import { RouterProvider, createMemoryHistory, createRootRoute, createRouter } from '@tanstack/react-router';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';

import FileNotFound from './file-not-found';

// Mock useReducedMotion
vi.mock('#hooks/useReducedMotion', () => ({
  useReducedMotion: vi.fn(() => false),
}));

// Create a router wrapper with configurable pathname
const createTestRouter = (pathname: string) => {
  const rootRoute = createRootRoute({
    component: () => <FileNotFound />,
  });

  return createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: [pathname] }),
  });
};

interface TestWrapperProps {
  pathname: string;
}

const TestWrapper: FC<TestWrapperProps> = ({ pathname }) => {
  const router = createTestRouter(pathname);
  return <RouterProvider router={router} />;
};

describe('FileNotFound', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('URL parsing edge cases', () => {
    test.each([
      { pathname: '/page', desc: 'single segment' },
      { pathname: '/a/b/c', desc: 'nested path' },
      { pathname: '/users/123', desc: 'numeric ID' },
      { pathname: '/items/550e8400-e29b-41d4-a716-446655440000', desc: 'UUID' },
    ])('$desc: displays path correctly', async ({ pathname }) => {
      await render(<TestWrapper pathname={pathname} />);

      // Wait for initial render
      await expect.element(page.getByText('FILE SYSTEM SCHEMATIC')).toBeInTheDocument();

      // The pathname should be displayed in the error details section
      // Use regex to match "Path: <pathname>" pattern
      await expect.element(page.getByText(new RegExp(`Path:\\s*${pathname.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`))).toBeInTheDocument();
    });

    test('root path shows default structure', async () => {
      await render(<TestWrapper pathname='/' />);

      await expect.element(page.getByText('FILE SYSTEM SCHEMATIC')).toBeInTheDocument();
      // Root path should still show the component
      await expect.element(page.getByText('ENOENT: FILE NOT FOUND')).toBeInTheDocument();
    });
  });

  describe('file tree generation', () => {
    test('marks last segment as missing with [NOT FOUND]', async () => {
      await render(<TestWrapper pathname='/test/missing' />);

      // The last segment should be marked as NOT FOUND
      await expect.element(page.getByText('[NOT FOUND]')).toBeInTheDocument();
    });

    test('displays directory structure header', async () => {
      await render(<TestWrapper pathname='/some/path' />);

      await expect.element(page.getByText('DIRECTORY STRUCTURE')).toBeInTheDocument();
    });

    test('displays root folder in tree', async () => {
      await render(<TestWrapper pathname='/test' />);

      // Root folder indicator
      await expect.element(page.getByText(/📁/)).toBeInTheDocument();
    });
  });

  describe('search path animation', () => {
    test('animates through segments over time', async () => {
      await render(<TestWrapper pathname='/a/b/c' />);

      // Initially shows search path section
      await expect.element(page.getByText('SEARCH PATH')).toBeInTheDocument();

      // Advance time to let animation progress
      await vi.advanceTimersByTimeAsync(600);

      // After animation progresses, check that paths are being added
      // The search path section shows checkmarks (✓ or ✗) with paths
      await vi.advanceTimersByTimeAsync(1200);

      // /a should appear in search path
      const searchPathExists = document.body.textContent?.includes('/a');
      expect(searchPathExists).toBe(true);
    });

    test('shows completion message after search', async () => {
      await render(<TestWrapper pathname='/test' />);

      // Advance through all paths (/ and /test = 2 paths * 600ms each + extra)
      await vi.advanceTimersByTimeAsync(1800);

      await expect.element(page.getByText('PATH RESOLUTION FAILED')).toBeInTheDocument();
    });
  });

  describe('reduced motion', () => {
    test('shows all paths immediately when reduced motion is on', async () => {
      const { useReducedMotion } = await import('#hooks/useReducedMotion');
      vi.mocked(useReducedMotion).mockReturnValue(true);

      await render(<TestWrapper pathname='/a/b' />);

      // All paths should be visible immediately in search path section
      // Check body contains all expected paths
      await expect
        .poll(() => {
          const text = document.body.textContent ?? '';
          return text.includes('/a/b') && text.includes('PATH RESOLUTION FAILED');
        })
        .toBe(true);
    });
  });

  describe('error details', () => {
    test('displays error code', async () => {
      await render(<TestWrapper pathname='/test' />);

      await expect.element(page.getByText('404 NOT_FOUND')).toBeInTheDocument();
    });

    test('displays ENOENT error message', async () => {
      await render(<TestWrapper pathname='/test' />);

      await expect.element(page.getByText('ENOENT: no such file or directory')).toBeInTheDocument();
    });

    test('displays current pathname in error details', async () => {
      await render(<TestWrapper pathname='/my/custom/path' />);

      // Use regex to match the path in error details section
      await expect.element(page.getByText(/Path:\s*\/my\/custom\/path/)).toBeInTheDocument();
    });
  });

  describe('navigation', () => {
    test('has link to home', async () => {
      await render(<TestWrapper pathname='/test' />);

      const link = page.getByText('ファイルを作成 → ホームへ戻る');
      await expect.element(link).toBeInTheDocument();

      const href = link.element()?.closest('a')?.getAttribute('href');
      expect(href).toBe('/');
    });
  });

  describe('visual elements', () => {
    test('displays schematic header', async () => {
      await render(<TestWrapper pathname='/test' />);

      await expect.element(page.getByText('FILE SYSTEM SCHEMATIC')).toBeInTheDocument();
    });

    test('displays main error title', async () => {
      await render(<TestWrapper pathname='/test' />);

      await expect.element(page.getByText('ENOENT: FILE NOT FOUND')).toBeInTheDocument();
    });
  });
});
