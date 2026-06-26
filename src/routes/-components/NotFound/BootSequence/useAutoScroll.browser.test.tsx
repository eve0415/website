/* oxlint-disable no-await-in-loop -- sequential click tests require await in loop */
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

  const { handleScroll } = useAutoScroll({
    containerRef,
    dependency,
    smooth,
  });

  return (
    <div>
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
  test('scrolls to bottom on dependency change (instant mode)', async () => {
    await render(<TestComponent smooth={false} />);

    const containerEl = page.getByTestId('scroll-container').element();

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

  test('does not scroll when user has scrolled up', async () => {
    await render(<TestComponent smooth={false} initialDependency={1} />);

    const containerEl = page.getByTestId('scroll-container').element();

    // Trigger initial scroll to bottom
    await page.getByTestId('increment').click();
    await waitForScroll();

    // User scrolls up
    containerEl.scrollTop = 50;
    containerEl.dispatchEvent(new Event('scroll', { bubbles: true }));
    await waitForScroll();

    const scrollTopAfterUserScroll = containerEl.scrollTop;

    // Trigger another dependency change
    await page.getByTestId('increment').click();
    await waitForScroll();

    // Should NOT have auto-scrolled since user scrolled up
    expect(containerEl.scrollTop).toBe(scrollTopAfterUserScroll);
  });

  test('resumes auto-scroll when user scrolls back to exact bottom', async () => {
    await render(<TestComponent smooth={false} initialDependency={1} />);

    const containerEl = page.getByTestId('scroll-container').element();

    // Trigger initial scroll to bottom
    await page.getByTestId('increment').click();
    await waitForScroll();

    // User scrolls up - auto-scroll pauses
    containerEl.scrollTop = 0;
    containerEl.dispatchEvent(new Event('scroll', { bubbles: true }));
    await waitForScroll();

    // User scrolls back to the exact bottom - auto-scroll re-engages
    containerEl.scrollTop = containerEl.scrollHeight - containerEl.clientHeight;
    containerEl.dispatchEvent(new Event('scroll', { bubbles: true }));
    await waitForScroll();

    // Next dependency change should auto-scroll again
    await page.getByTestId('increment').click();
    await waitForScroll();

    const expectedScrollTop = containerEl.scrollHeight - containerEl.clientHeight;
    expect(containerEl.scrollTop).toBe(expectedScrollTop);
  });

  test('handles dependency not changing', async () => {
    await render(<TestComponent smooth={false} initialDependency={10} />);

    const containerEl = page.getByTestId('scroll-container').element();

    const initialScrollTop = containerEl.scrollTop;

    // Click set-10 when already at 10 (no change)
    await page.getByTestId('set-10').click();
    await waitForScroll();

    // Scroll position should not change when dependency doesn't change
    expect(containerEl.scrollTop).toBe(initialScrollTop);
  });

  test('respects 1px tolerance for bottom detection', async () => {
    await render(<TestComponent smooth={false} />);

    const containerEl = page.getByTestId('scroll-container').element();

    // Scroll to almost bottom (within 1px tolerance)
    const maxScroll = containerEl.scrollHeight - containerEl.clientHeight;
    containerEl.scrollTop = maxScroll - 0.5; // Within 1px tolerance
    containerEl.dispatchEvent(new Event('scroll', { bubbles: true }));
    await waitForScroll();

    // Still considered "at bottom" - dependency change should auto-scroll
    await page.getByTestId('increment').click();
    await waitForScroll();

    expect(containerEl.scrollTop).toBe(maxScroll);
  });

  test('treats more than 1px from bottom as scrolled up', async () => {
    await render(<TestComponent smooth={false} initialDependency={1} />);

    const containerEl = page.getByTestId('scroll-container').element();

    // First get to bottom
    await page.getByTestId('increment').click();
    await waitForScroll();

    // Scroll to more than 1px from bottom
    const maxScroll = containerEl.scrollHeight - containerEl.clientHeight;
    containerEl.scrollTop = maxScroll - 2; // More than 1px tolerance
    containerEl.dispatchEvent(new Event('scroll', { bubbles: true }));
    await waitForScroll();

    // NOT considered "at bottom" - dependency change should not auto-scroll
    await page.getByTestId('increment').click();
    await waitForScroll();

    expect(containerEl.scrollTop).toBe(maxScroll - 2);
  });

  test('rapid dependency changes do not break state', async () => {
    await render(<TestComponent smooth={false} />);

    const containerEl = page.getByTestId('scroll-container').element();

    // Rapidly click multiple times
    for (let i = 0; i < 5; i++) await page.getByTestId('increment').click();

    // Wait for all effects to settle
    await waitForScroll();

    // Component should still function and stay pinned to the bottom
    await expect.element(page.getByTestId('dependency')).toHaveTextContent('5');
    const expectedScrollTop = containerEl.scrollHeight - containerEl.clientHeight;
    expect(containerEl.scrollTop).toBe(expectedScrollTop);
  });
});
