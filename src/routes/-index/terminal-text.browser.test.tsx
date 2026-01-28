import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';

import TerminalText from './terminal-text';

describe('terminalText', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('renders with required text prop only (default parameters)', async () => {
    // This covers line 13 default parameter branch
    await render(<TerminalText text='Hello' />);

    // Fast-forward time for typing to complete
    await vi.advanceTimersByTimeAsync(500);

    const element = page.getByText('Hello');
    await expect.element(element).toBeInTheDocument();
  });

  test('renders with all props provided', async () => {
    const onComplete = vi.fn();

    await render(<TerminalText text='Test' delay={0} speed={10} className='custom' onComplete={onComplete} />);

    // Fast-forward time for typing to complete
    await vi.advanceTimersByTimeAsync(200);

    await expect.element(page.getByText('Test')).toBeInTheDocument();
    expect(onComplete).toHaveBeenCalledWith();
  });

  test('applies custom className', async () => {
    const { container } = await render(<TerminalText text='Hi' className='test-class' />);

    // Fast-forward for render
    await vi.advanceTimersByTimeAsync(100);

    const span = container.querySelector('.test-class');
    expect(span).not.toBeNull();
  });

  test('shows cursor during typing', async () => {
    const { container } = await render(<TerminalText text='LongText' speed={100} />);

    // Fast-forward slightly into typing
    await vi.advanceTimersByTimeAsync(50);

    // Check for cursor element (animate-blink class)
    const cursor = container.querySelector('.animate-blink');
    expect(cursor).not.toBeNull();
  });

  test('respects delay before starting', async () => {
    await render(<TerminalText text='Delayed' delay={200} speed={10} />);

    // Immediately after render, text should be empty
    const element = page.getByText('Delayed');
    await expect.element(element).not.toBeInTheDocument();

    // Fast-forward past delay + typing time
    await vi.advanceTimersByTimeAsync(400);

    await expect.element(page.getByText('Delayed')).toBeInTheDocument();
  });

  test('calls onComplete when typing finishes', async () => {
    const onComplete = vi.fn();

    await render(<TerminalText text='Done' delay={0} speed={10} onComplete={onComplete} />);

    // Fast-forward for completion
    await vi.advanceTimersByTimeAsync(300);

    expect(onComplete).toHaveBeenCalledOnce();
  });
});
