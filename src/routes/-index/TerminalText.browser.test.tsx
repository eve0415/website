import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';

import TerminalText from './TerminalText';

describe('TerminalText', () => {
  test('renders with required text prop only (default parameters)', async () => {
    // This covers line 13 default parameter branch
    await render(<TerminalText text='Hello' />);

    // Eventually the text should appear
    await new Promise(resolve => setTimeout(resolve, 500));

    const element = page.getByText('Hello');
    await expect.element(element).toBeInTheDocument();
  });

  test('renders with all props provided', async () => {
    const onComplete = vi.fn();

    await render(<TerminalText text='Test' delay={0} speed={10} className='custom' onComplete={onComplete} />);

    // Wait for typing to complete
    await new Promise(resolve => setTimeout(resolve, 200));

    await expect.element(page.getByText('Test')).toBeInTheDocument();
    expect(onComplete).toHaveBeenCalled();
  });

  test('applies custom className', async () => {
    const { container } = await render(<TerminalText text='Hi' className='test-class' />);

    // Wait for render
    await new Promise(resolve => setTimeout(resolve, 100));

    const span = container.querySelector('.test-class');
    expect(span).not.toBeNull();
  });

  test('shows cursor during typing', async () => {
    const { container } = await render(<TerminalText text='LongText' speed={100} />);

    // During typing, cursor should be visible
    await new Promise(resolve => setTimeout(resolve, 50));

    // Check for cursor element (animate-blink class)
    const cursor = container.querySelector('.animate-blink');
    expect(cursor).not.toBeNull();
  });

  test('respects delay before starting', async () => {
    await render(<TerminalText text='Delayed' delay={200} speed={10} />);

    // Immediately after render, text should be empty
    const element = page.getByText('Delayed');
    await expect.element(element).not.toBeInTheDocument();

    // After delay + typing time
    await new Promise(resolve => setTimeout(resolve, 400));

    await expect.element(page.getByText('Delayed')).toBeInTheDocument();
  });

  test('calls onComplete when typing finishes', async () => {
    const onComplete = vi.fn();

    await render(<TerminalText text='Done' delay={0} speed={10} onComplete={onComplete} />);

    // Wait for completion
    await new Promise(resolve => setTimeout(resolve, 300));

    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
