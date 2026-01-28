/* oxlint-disable typescript-eslint(no-unsafe-type-assertion), eslint(no-await-in-loop) -- Test file requires HTMLDivElement casts; sequential click tests require await in loop */
import type { FC } from 'react';

import { useRef, useState } from 'react';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';

import { useAutoScroll } from './useAutoScroll';

interface TestComponentProps {
  initialDependency?: number;
  smooth?: boolean | 'auto';
  containerHeight?: number;
  contentHeight?: number;
}

const TestComponent: FC<TestComponentProps> = ({ initialDependency = 0, smooth = false, containerHeight = 100, contentHeight = 300 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dependency, setDependency] = useState(initialDependency);

  const { isAutoScrolling, handleScroll } = useAutoScroll({
    containerRef,
    dependency,
    smooth,
  });

  return (
    <div>
      <div data-testid='is-auto-scrolling'>{String(isAutoScrolling)}</div>
      <div data-testid='dependency'>{dependency}</div>
      <div
        ref={containerRef}
        data-testid='scroll-container'
        onScroll={handleScroll}
        style={{
          height: `${containerHeight}px`,
          overflow: 'auto',
          border: '1px solid gray',
        }}
      >
        <div data-testid='scroll-content' style={{ height: `${contentHeight}px` }}>
          Scrollable content
        </div>
      </div>
      <button
        data-testid='increment'
        onClick={() => {
          setDependency(d => d + 1);
        }}
        type='button'
      >
        Increment
      </button>
      <button
        data-testid='increment-5'
        onClick={() => {
          setDependency(d => d + 5);
        }}
        type='button'
      >
        Increment +5
      </button>
      <button
        data-testid='set-10'
        onClick={() => {
          setDependency(10);
        }}
        type='button'
      >
        Set to 10
      </button>
    </div>
  );
};

// Helper to wait for scroll to settle
const waitForScroll = async () =>
  new Promise(resolve => {
    setTimeout(resolve, 50);
  });

describe('useAutoScroll', () => {
  test('starts with auto-scrolling enabled (at bottom)', async () => {
    await render(<TestComponent />);

    await expect.element(page.getByTestId('is-auto-scrolling')).toHaveTextContent('true');
  });

  test('scrolls to bottom on dependency change (instant mode)', async () => {
    await render(<TestComponent smooth={false} />);

    const container = page.getByTestId('scroll-container');
    const containerEl = container.element() as HTMLDivElement;

    // Initial scroll position is 0
    expect(containerEl.scrollTop).toBe(0);

    // Increment dependency
    await page.getByTestId('increment').click();

    // Wait for effect to run
    await waitForScroll();

    // Container should have scrolled to bottom
    const expectedScrollTop = containerEl.scrollHeight - containerEl.clientHeight;
    expect(containerEl.scrollTop).toBe(expectedScrollTop);
  });

  test('pauses auto-scroll when user scrolls up', async () => {
    await render(<TestComponent smooth={false} initialDependency={1} />);

    const container = page.getByTestId('scroll-container');
    const containerEl = container.element() as HTMLDivElement;

    // First scroll to bottom by triggering a dependency change
    await page.getByTestId('increment').click();
    await waitForScroll();

    // Confirm we're at bottom
    await expect.element(page.getByTestId('is-auto-scrolling')).toHaveTextContent('true');

    // Now user scrolls up manually (simulate user action)
    containerEl.scrollTop = 0;
    containerEl.dispatchEvent(new Event('scroll', { bubbles: true }));

    // Auto-scrolling should be disabled
    await expect.element(page.getByTestId('is-auto-scrolling')).toHaveTextContent('false');
  });

  test('resumes auto-scroll when user scrolls to exact bottom', async () => {
    await render(<TestComponent smooth={false} initialDependency={1} />);

    const container = page.getByTestId('scroll-container');
    const containerEl = container.element() as HTMLDivElement;

    // First trigger scroll to bottom
    await page.getByTestId('increment').click();
    await waitForScroll();

    // User scrolls up
    containerEl.scrollTop = 0;
    containerEl.dispatchEvent(new Event('scroll', { bubbles: true }));
    await expect.element(page.getByTestId('is-auto-scrolling')).toHaveTextContent('false');

    // User scrolls back to bottom (exact)
    containerEl.scrollTop = containerEl.scrollHeight - containerEl.clientHeight;
    containerEl.dispatchEvent(new Event('scroll', { bubbles: true }));

    // Auto-scrolling should re-engage
    await expect.element(page.getByTestId('is-auto-scrolling')).toHaveTextContent('true');
  });

  test('does not scroll when user has scrolled up', async () => {
    await render(<TestComponent smooth={false} initialDependency={1} />);

    const container = page.getByTestId('scroll-container');
    const containerEl = container.element() as HTMLDivElement;

    // Trigger initial scroll to bottom
    await page.getByTestId('increment').click();
    await waitForScroll();

    // User scrolls up
    containerEl.scrollTop = 50;
    containerEl.dispatchEvent(new Event('scroll', { bubbles: true }));
    await expect.element(page.getByTestId('is-auto-scrolling')).toHaveTextContent('false');

    const scrollTopAfterUserScroll = containerEl.scrollTop;

    // Trigger another dependency change
    await page.getByTestId('increment').click();
    await waitForScroll();

    // Should NOT have auto-scrolled since user scrolled up
    expect(containerEl.scrollTop).toBe(scrollTopAfterUserScroll);
  });

  test('handles dependency not changing', async () => {
    await render(<TestComponent smooth={false} initialDependency={10} />);

    const container = page.getByTestId('scroll-container');
    const containerEl = container.element() as HTMLDivElement;

    const initialScrollTop = containerEl.scrollTop;

    // Click set-10 when already at 10 (no change)
    await page.getByTestId('set-10').click();
    await waitForScroll();

    // Scroll position should not change when dependency doesn't change
    expect(containerEl.scrollTop).toBe(initialScrollTop);
  });

  test('respects 1px tolerance for bottom detection', async () => {
    await render(<TestComponent smooth={false} />);

    const container = page.getByTestId('scroll-container');
    const containerEl = container.element() as HTMLDivElement;

    // Scroll to almost bottom (within 1px tolerance)
    const maxScroll = containerEl.scrollHeight - containerEl.clientHeight;
    containerEl.scrollTop = maxScroll - 0.5; // Within 1px tolerance
    containerEl.dispatchEvent(new Event('scroll', { bubbles: true }));

    // Should still be considered "at bottom"
    await expect.element(page.getByTestId('is-auto-scrolling')).toHaveTextContent('true');
  });

  test('detects not at bottom when more than 1px away', async () => {
    await render(<TestComponent smooth={false} initialDependency={1} />);

    const container = page.getByTestId('scroll-container');
    const containerEl = container.element() as HTMLDivElement;

    // First get to bottom
    await page.getByTestId('increment').click();
    await waitForScroll();

    // Scroll to more than 1px from bottom
    const maxScroll = containerEl.scrollHeight - containerEl.clientHeight;
    containerEl.scrollTop = maxScroll - 2; // More than 1px tolerance
    containerEl.dispatchEvent(new Event('scroll', { bubbles: true }));

    // Should NOT be considered "at bottom"
    await expect.element(page.getByTestId('is-auto-scrolling')).toHaveTextContent('false');
  });

  test('rapid dependency changes do not break state', async () => {
    await render(<TestComponent smooth={false} />);

    // Rapidly click multiple times
    for (let i = 0; i < 5; i++) await page.getByTestId('increment').click();

    // Wait for all effects to settle
    await waitForScroll();

    // Component should still function
    await expect.element(page.getByTestId('dependency')).toHaveTextContent('5');
    await expect.element(page.getByTestId('is-auto-scrolling')).toHaveTextContent('true');
  });
});
