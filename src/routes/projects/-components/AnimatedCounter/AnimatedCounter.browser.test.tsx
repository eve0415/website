import { afterEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';

import AnimatedCounter from './AnimatedCounter';

describe('AnimatedCounter', () => {
  const originalIntersectionObserver = window.IntersectionObserver;

  afterEach(() => {
    window.IntersectionObserver = originalIntersectionObserver;
  });

  test('renders with default parameters (line 11)', async () => {
    // This covers the default parameters: duration = 2000, suffix = ''
    await render(<AnimatedCounter end={100} />);

    // Counter should render with data-counter attribute
    await expect.element(page.getByText('0')).toBeInTheDocument();
  });

  test('renders with custom duration', async () => {
    await render(<AnimatedCounter end={50} duration={500} />);

    await expect.element(page.getByText('0')).toBeInTheDocument();
  });

  test('renders with suffix', async () => {
    await render(<AnimatedCounter end={100} suffix='%' />);

    // Initial value with suffix
    await expect.element(page.getByText('0%')).toBeInTheDocument();
  });

  test('animates when element is visible', async () => {
    // Create a proper mock IntersectionObserver class
    type Callback = IntersectionObserverCallback;
    let savedCallback: Callback | null = null;

    class MockIntersectionObserver implements IntersectionObserver {
      root: Element | Document | null = null;
      rootMargin = '';
      thresholds: readonly number[] = [];

      constructor(callback: Callback) {
        savedCallback = callback;
      }

      observe(target: Element) {
        // Trigger intersection after a small delay
        setTimeout(() => {
          savedCallback?.([{ isIntersecting: true, target } as IntersectionObserverEntry], this);
        }, 10);
      }
      disconnect = vi.fn();
      unobserve = vi.fn();
      takeRecords = vi.fn(() => []);
    }

    window.IntersectionObserver = MockIntersectionObserver;

    await render(<AnimatedCounter end={100} duration={500} />);

    // Wait for animation to complete
    await new Promise(resolve => setTimeout(resolve, 700));

    // Should have animated to the final value
    await expect.element(page.getByText('100')).toBeInTheDocument();
  });

  test('applies correct styling', async () => {
    const { container } = await render(<AnimatedCounter end={50} />);

    const counter = container.querySelector('.font-mono.text-3xl.text-neon');
    expect(counter).not.toBeNull();
  });

  test('does not re-animate after first animation', async () => {
    // Create a proper mock IntersectionObserver class
    type Callback = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => void;
    let observedElement: Element | undefined;
    let mockObserverInstance: MockIntersectionObserver | undefined;

    class MockIntersectionObserver implements IntersectionObserver {
      root: Element | Document | null = null;
      rootMargin = '';
      thresholds: readonly number[] = [];
      private callback: Callback;

      constructor(callback: Callback) {
        this.callback = callback;
        // eslint-disable-next-line ts/no-this-alias -- Required for test to access instance
        mockObserverInstance = this;
      }

      observe(target: Element) {
        observedElement = target;
      }

      triggerIntersection() {
        if (observedElement !== undefined) {
          this.callback(
            [
              { isIntersecting: true, target: observedElement, boundingClientRect: {}, intersectionRatio: 1, intersectionRect: {}, rootBounds: null, time: 0 },
            ] as unknown as IntersectionObserverEntry[],
            this,
          );
        }
      }
      disconnect = vi.fn();
      unobserve = vi.fn();
      takeRecords = vi.fn(() => []);
    }

    window.IntersectionObserver = MockIntersectionObserver;

    await render(<AnimatedCounter end={100} duration={100} />);

    // Trigger first intersection manually
    mockObserverInstance?.triggerIntersection();

    await new Promise(resolve => setTimeout(resolve, 200));

    // Trigger second intersection
    mockObserverInstance?.triggerIntersection();

    await new Promise(resolve => setTimeout(resolve, 200));

    // Should still show 100, not restart animation
    await expect.element(page.getByText('100')).toBeInTheDocument();
  });
});
