import type { FC } from 'react';

import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';

import { useReducedMotion } from './useReducedMotion';

const TestComponent: FC = () => {
  const reducedMotion = useReducedMotion();
  return <div data-testid='result'>{String(reducedMotion)}</div>;
};

describe('useReducedMotion', () => {
  test('returns false when prefers-reduced-motion is not enabled', async () => {
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    await render(<TestComponent />);

    await expect.element(page.getByTestId('result')).toHaveTextContent('false');
  });

  test('returns true when prefers-reduced-motion is enabled', async () => {
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    await render(<TestComponent />);

    await expect.element(page.getByTestId('result')).toHaveTextContent('true');
  });

  test('responds to media query changes', async () => {
    type ChangeListener = (this: MediaQueryList, ev: MediaQueryListEvent) => void;
    let changeListener: ChangeListener | null = null;

    const mockMediaQuery = {
      matches: false,
      media: '(prefers-reduced-motion: reduce)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn((event: string, listener: ChangeListener) => {
        if (event === 'change') {
          changeListener = listener;
        }
      }),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };

    window.matchMedia = vi.fn().mockReturnValue(mockMediaQuery);

    await render(<TestComponent />);

    await expect.element(page.getByTestId('result')).toHaveTextContent('false');

    // Simulate media query change
    mockMediaQuery.matches = true;
    changeListener!.call(mockMediaQuery, new Event('change') as MediaQueryListEvent);

    await expect.element(page.getByTestId('result')).toHaveTextContent('true');
  });

  test('cleans up event listener on unmount', async () => {
    const removeEventListener = vi.fn();

    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      media: '(prefers-reduced-motion: reduce)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener,
      dispatchEvent: vi.fn(),
    });

    const screen = await render(<TestComponent />);

    await screen.unmount();

    expect(removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });
});
