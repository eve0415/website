/* oxlint-disable typescript-eslint(no-non-null-assertion), typescript-eslint(no-unsafe-type-assertion), eslint-plugin-jest(no-disabled-tests) -- Test assertions verify existence; level cast is safe for mock data; requestAnimationFrame untestable in browser tests */
import type { ContributionDay } from '../../-utils/github-stats-utils';

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';

import CodeRadar from './code-radar';

// Generate mock contribution data
const generateMockContributions = (): ContributionDay[] => {
  const days: ContributionDay[] = [];
  const startDate = new Date('2024-01-01');

  for (let i = 0; i < 365; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    days.push({
      date: date.toISOString().split('T')[0]!,
      count: Math.floor(Math.random() * 10),
      level: Math.floor(Math.random() * 5) as 0 | 1 | 2 | 3 | 4,
    });
  }

  return days;
};

const mockContributions = generateMockContributions();

describe('codeRadar', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('renders canvas element', async () => {
    const { container } = await render(<CodeRadar contributionCalendar={mockContributions} />);

    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();
  });

  test('renders CODE_RADAR header', async () => {
    await render(<CodeRadar contributionCalendar={mockContributions} />);

    await expect.element(page.getByText('CODE_RADAR')).toBeInTheDocument();
  });

  test('shows SCANNING during boot animation', async () => {
    // Ensure reduced motion is off
    const originalMatchMedia = globalThis.matchMedia;
    vi.spyOn(globalThis, 'matchMedia').mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    await render(<CodeRadar contributionCalendar={mockContributions} />);

    // During boot, SCANNING should be visible
    await expect.element(page.getByText('SCANNING...')).toBeInTheDocument();

    globalThis.matchMedia = originalMatchMedia;
  });

  // SKIP: Fake timers don't properly mock requestAnimationFrame in browser test environment.
  // The animation uses requestAnimationFrame which is tied to display refresh, not timer-based.
  // The reduced motion test below verifies onBootComplete works correctly.
  test.skip('calls onBootComplete when animation finishes (lines 216-217)', async () => {
    const onBootComplete = vi.fn();

    // Ensure reduced motion is off
    const originalMatchMedia = globalThis.matchMedia;
    vi.spyOn(globalThis, 'matchMedia').mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    await render(<CodeRadar contributionCalendar={mockContributions} onBootComplete={onBootComplete} />);

    // Fast-forward for boot animation to complete (2000ms + buffer)
    await vi.advanceTimersByTimeAsync(2500);

    expect(onBootComplete).toHaveBeenCalledOnce();

    globalThis.matchMedia = originalMatchMedia;
  });

  test('skips boot animation with reduced motion', async () => {
    const onBootComplete = vi.fn();

    // Mock reduced motion preference
    const originalMatchMedia = globalThis.matchMedia;
    vi.spyOn(globalThis, 'matchMedia').mockImplementation(query => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    await render(<CodeRadar contributionCalendar={mockContributions} onBootComplete={onBootComplete} />);

    // With reduced motion, onBootComplete should be called immediately
    await vi.advanceTimersByTimeAsync(100);

    expect(onBootComplete).toHaveBeenCalledWith();

    globalThis.matchMedia = originalMatchMedia;
  });

  test('handles empty contribution data', async () => {
    const { container } = await render(<CodeRadar contributionCalendar={[]} />);

    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();
  });

  test('renders contribution levels correctly', async () => {
    // Create data with all level types
    const dataWithAllLevels: ContributionDay[] = [
      { date: '2024-01-01', count: 0, level: 0 },
      { date: '2024-01-02', count: 1, level: 1 },
      { date: '2024-01-03', count: 5, level: 2 },
      { date: '2024-01-04', count: 10, level: 3 },
      { date: '2024-01-05', count: 20, level: 4 },
    ];

    const { container } = await render(<CodeRadar contributionCalendar={dataWithAllLevels} />);

    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();
  });

  test('cleans up animation on unmount', async () => {
    const cancelAnimationFrameSpy = vi.spyOn(globalThis, 'cancelAnimationFrame');

    const originalMatchMedia = globalThis.matchMedia;
    vi.spyOn(globalThis, 'matchMedia').mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const screen = await render(<CodeRadar contributionCalendar={mockContributions} />);

    await screen.unmount();

    // oxlint-disable-next-line vitest(prefer-called-with) -- toHaveBeenCalled() is correct; we only care that it was called, not the specific args
    expect(cancelAnimationFrameSpy).toHaveBeenCalled();

    cancelAnimationFrameSpy.mockRestore();
    globalThis.matchMedia = originalMatchMedia;
  });
});
