/* oxlint-disable vitest/no-conditional-in-test -- conditional in mock addEventListener captures the change listener */
import type { FC } from 'react';

import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';

import { createMediaQueryListMock } from '#test/utils/media-query-mock';

import { useReducedMotion } from './useReducedMotion';

const TestComponent: FC = () => {
  const reducedMotion = useReducedMotion();
  return <div data-testid='result'>{String(reducedMotion)}</div>;
};

describe('useReducedMotion', () => {
  test('returns false when prefers-reduced-motion is not enabled', async () => {
    vi.spyOn(globalThis, 'matchMedia').mockImplementation(query => createMediaQueryListMock(false, query));

    await render(<TestComponent />);

    await expect.element(page.getByTestId('result')).toHaveTextContent('false');
  });

  test('returns true when prefers-reduced-motion is enabled', async () => {
    vi.spyOn(globalThis, 'matchMedia').mockImplementation(query => createMediaQueryListMock(query === '(prefers-reduced-motion: reduce)', query));

    await render(<TestComponent />);

    await expect.element(page.getByTestId('result')).toHaveTextContent('true');
  });

  test('responds to media query changes', async () => {
    let changeListener: EventListener | undefined;

    const mockMediaQuery = createMediaQueryListMock(false, '(prefers-reduced-motion: reduce)');
    vi.mocked(mockMediaQuery.addEventListener).mockImplementation((event, listener) => {
      if (event === 'change' && typeof listener === 'function') changeListener = listener;
    });

    vi.spyOn(globalThis, 'matchMedia').mockReturnValue(mockMediaQuery);

    await render(<TestComponent />);

    await expect.element(page.getByTestId('result')).toHaveTextContent('false');

    if (!changeListener) throw new Error('the hook never registered a change listener');

    // Simulate media query change
    mockMediaQuery.matches = true;
    changeListener.call(mockMediaQuery, new Event('change'));

    await expect.element(page.getByTestId('result')).toHaveTextContent('true');
  });

  test('cleans up event listener on unmount', async () => {
    const mockMediaQuery = createMediaQueryListMock(false, '(prefers-reduced-motion: reduce)');

    vi.spyOn(globalThis, 'matchMedia').mockReturnValue(mockMediaQuery);

    const screen = await render(<TestComponent />);

    await screen.unmount();

    expect(mockMediaQuery.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });
});
