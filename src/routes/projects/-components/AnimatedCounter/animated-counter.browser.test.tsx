import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';

import AnimatedCounter from './animated-counter';

describe('AnimatedCounter', () => {
  const originalIntersectionObserver = window.IntersectionObserver;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    window.IntersectionObserver = originalIntersectionObserver;
  });

  test('renders with default parameters (line 11)', async () => {
    // This covers the default parameters: duration = 2000, suffix = ''
    await render(<AnimatedCounter end={100} />);

    // Counter should render starting at 0
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

  test('animates when isVisible prop is true', async () => {
    // Use isVisible prop for direct control (shared observer pattern)
    await render(<AnimatedCounter end={100} duration={500} isVisible={true} />);

    // Fast-forward for animation to complete
    await vi.advanceTimersByTimeAsync(700);

    // Should have animated to the final value
    await expect.element(page.getByText('100')).toBeInTheDocument();
  });

  test('does not animate when isVisible prop is false', async () => {
    await render(<AnimatedCounter end={100} duration={500} isVisible={false} />);

    // Fast-forward past animation duration
    await vi.advanceTimersByTimeAsync(700);

    // Should still be at 0 since not visible
    await expect.element(page.getByText('0')).toBeInTheDocument();
  });

  test('applies correct styling', async () => {
    const { container } = await render(<AnimatedCounter end={50} />);

    const counter = container.querySelector('.font-mono.text-3xl.text-neon');
    expect(counter).not.toBeNull();
  });

  test('creates internal observer when isVisible prop is not provided', async () => {
    // Mock IntersectionObserver to verify it's created
    const observeMock = vi.fn();
    const disconnectMock = vi.fn();

    class MockIntersectionObserver implements IntersectionObserver {
      root: Element | Document | null = null;
      rootMargin = '';
      thresholds: readonly number[] = [];

      constructor(_callback: IntersectionObserverCallback) {}
      observe = observeMock;
      disconnect = disconnectMock;
      unobserve = vi.fn();
      takeRecords = vi.fn(() => []);
    }

    window.IntersectionObserver = MockIntersectionObserver;

    await render(<AnimatedCounter end={100} duration={500} />);

    // Observer should have been created and element observed
    expect(observeMock).toHaveBeenCalled();
  });

  test('does not create internal observer when isVisible prop is provided', async () => {
    // Mock IntersectionObserver to verify it's NOT created
    const observeMock = vi.fn();

    class MockIntersectionObserver implements IntersectionObserver {
      root: Element | Document | null = null;
      rootMargin = '';
      thresholds: readonly number[] = [];

      constructor(_callback: IntersectionObserverCallback) {}
      observe = observeMock;
      disconnect = vi.fn();
      unobserve = vi.fn();
      takeRecords = vi.fn(() => []);
    }

    window.IntersectionObserver = MockIntersectionObserver;

    await render(<AnimatedCounter end={100} duration={500} isVisible={true} />);

    // Observer should NOT have been created since isVisible is provided
    expect(observeMock).not.toHaveBeenCalled();
  });

  test('does not re-animate after first animation', async () => {
    // Use isVisible prop for direct control
    const { rerender } = await render(<AnimatedCounter end={100} duration={100} isVisible={true} />);

    // Fast-forward for animation to complete
    await vi.advanceTimersByTimeAsync(200);

    // Should have animated to the final value
    await expect.element(page.getByText('100')).toBeInTheDocument();

    // Re-render with same props - should not re-animate
    await rerender(<AnimatedCounter end={100} duration={100} isVisible={true} />);

    await vi.advanceTimersByTimeAsync(200);

    // Should still show 100, not restart animation
    await expect.element(page.getByText('100')).toBeInTheDocument();
  });
});
