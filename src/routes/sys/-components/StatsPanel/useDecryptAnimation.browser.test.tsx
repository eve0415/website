import type { FC } from 'react';

import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';

import { useDecryptAnimation, useDecryptNumber } from './useDecryptAnimation';

interface TestComponentProps {
  value: string | number;
  duration?: number;
  delay?: number;
  enabled?: boolean;
}

const TestComponent: FC<TestComponentProps> = ({ value, duration, delay, enabled }) => {
  const displayValue = useDecryptAnimation(value, { duration, delay, enabled });
  return <div data-testid='result'>{displayValue}</div>;
};

// Component that uses default options entirely (line 11 coverage)
const DefaultOptionsComponent: FC<{ value: string | number }> = ({ value }) => {
  const displayValue = useDecryptAnimation(value);
  return <div data-testid='default-result'>{displayValue}</div>;
};

const NumberTestComponent: FC<Omit<TestComponentProps, 'value'> & { value: number }> = ({ value, duration, delay, enabled }) => {
  const displayValue = useDecryptNumber(value, { duration, delay, enabled });
  return <div data-testid='result'>{displayValue}</div>;
};

describe('useDecryptAnimation', () => {
  test('returns final value immediately when enabled is false', async () => {
    await render(<TestComponent value='TEST' enabled={false} />);

    await expect.element(page.getByTestId('result')).toHaveTextContent('TEST');
  });

  test('returns [ENCRYPTED] initially when enabled', async () => {
    await render(<TestComponent value='TEST' />);

    await expect.element(page.getByTestId('result')).toHaveTextContent('[ENCRYPTED]');
  });

  test('animation progresses over time', async () => {
    await render(<TestComponent value='TEST' duration={200} />);

    await expect.element(page.getByTestId('result')).toHaveTextContent('[ENCRYPTED]');

    // Wait for animation to start and progress
    await new Promise(resolve => setTimeout(resolve, 100));

    // At 50%, approximately 2 of 4 characters should be locked
    const halfway = page.getByTestId('result').element().textContent;
    expect(halfway).not.toBe('[ENCRYPTED]');
    expect(halfway).not.toBe('TEST');

    // Wait for completion
    await new Promise(resolve => setTimeout(resolve, 150));

    await expect.element(page.getByTestId('result')).toHaveTextContent('TEST');
  });

  test('ends with exact final value', async () => {
    await render(<TestComponent value='EXACT' duration={100} />);

    await new Promise(resolve => setTimeout(resolve, 150));

    await expect.element(page.getByTestId('result')).toHaveTextContent('EXACT');
  });

  test('respects delay option', async () => {
    await render(<TestComponent value='TEST' duration={100} delay={200} />);

    await expect.element(page.getByTestId('result')).toHaveTextContent('[ENCRYPTED]');

    // Before delay completes
    await new Promise(resolve => setTimeout(resolve, 100));
    await expect.element(page.getByTestId('result')).toHaveTextContent('[ENCRYPTED]');

    // After delay and animation complete
    await new Promise(resolve => setTimeout(resolve, 250));
    await expect.element(page.getByTestId('result')).toHaveTextContent('TEST');
  });

  test('respects duration option', async () => {
    await render(<TestComponent value='TEST' duration={400} />);

    // After half duration, should not be complete
    await new Promise(resolve => setTimeout(resolve, 200));
    const halfway = page.getByTestId('result').element().textContent;
    expect(halfway).not.toBe('TEST');

    // After full duration, should be complete
    await new Promise(resolve => setTimeout(resolve, 250));
    await expect.element(page.getByTestId('result')).toHaveTextContent('TEST');
  });

  test('only animates once (ref guard)', async () => {
    const screen = await render(<TestComponent value='FIRST' duration={100} />);

    await new Promise(resolve => setTimeout(resolve, 150));

    await expect.element(page.getByTestId('result')).toHaveTextContent('FIRST');

    // Rerender with same value - should not animate again
    await screen.rerender(<TestComponent value='FIRST' duration={100} />);

    await expect.element(page.getByTestId('result')).toHaveTextContent('FIRST');
  });

  test('locks characters from left to right', async () => {
    await render(<TestComponent value='ABCD' duration={300} />);

    // At ~33% progress, first character should be locked
    await new Promise(resolve => setTimeout(resolve, 120));
    const quarter = page.getByTestId('result').element().textContent;
    expect(quarter?.[0]).toBe('A');

    // At ~67% progress, first two/three characters should be locked
    await new Promise(resolve => setTimeout(resolve, 100));
    const twoThirds = page.getByTestId('result').element().textContent;
    expect(twoThirds?.[0]).toBe('A');
    expect(twoThirds?.[1]).toBe('B');

    // Complete
    await new Promise(resolve => setTimeout(resolve, 130));
    await expect.element(page.getByTestId('result')).toHaveTextContent('ABCD');
  });

  test('handles numeric input converted to string', async () => {
    await render(<TestComponent value={12345} duration={100} />);

    await new Promise(resolve => setTimeout(resolve, 150));

    await expect.element(page.getByTestId('result')).toHaveTextContent('12345');
  });

  test('handles empty string', async () => {
    await render(<TestComponent value='' duration={100} />);

    await new Promise(resolve => setTimeout(resolve, 150));

    await expect.element(page.getByTestId('result')).toHaveTextContent('');
  });

  test('handles single character', async () => {
    await render(<TestComponent value='X' duration={100} />);

    await new Promise(resolve => setTimeout(resolve, 150));

    await expect.element(page.getByTestId('result')).toHaveTextContent('X');
  });

  test('uses default options when none provided (line 11)', async () => {
    // This tests the default parameter: options = {}
    await render(<DefaultOptionsComponent value='DEFAULT' />);

    // Should start with [ENCRYPTED] since enabled defaults to true
    await expect.element(page.getByTestId('default-result')).toHaveTextContent('[ENCRYPTED]');

    // Wait for default duration (1500ms) + delay (0ms) + buffer
    await new Promise(resolve => setTimeout(resolve, 1700));

    await expect.element(page.getByTestId('default-result')).toHaveTextContent('DEFAULT');
  });
});

describe('useDecryptNumber', () => {
  test('formats number with locale (thousands separator)', async () => {
    await render(<NumberTestComponent value={1000} duration={100} />);

    await new Promise(resolve => setTimeout(resolve, 150));

    await expect.element(page.getByTestId('result')).toHaveTextContent('1,000');
  });

  test('formats large numbers correctly', async () => {
    await render(<NumberTestComponent value={1234567} duration={100} />);

    await new Promise(resolve => setTimeout(resolve, 150));

    await expect.element(page.getByTestId('result')).toHaveTextContent('1,234,567');
  });

  test('passes options through to animation', async () => {
    await render(<NumberTestComponent value={100} enabled={false} />);

    // Should show formatted number immediately without animation
    await expect.element(page.getByTestId('result')).toHaveTextContent('100');
  });

  test('animates formatted number', async () => {
    await render(<NumberTestComponent value={5000} duration={100} />);

    await expect.element(page.getByTestId('result')).toHaveTextContent('[ENCRYPTED]');

    await new Promise(resolve => setTimeout(resolve, 150));

    await expect.element(page.getByTestId('result')).toHaveTextContent('5,000');
  });

  test('handles zero', async () => {
    await render(<NumberTestComponent value={0} duration={100} />);

    await new Promise(resolve => setTimeout(resolve, 150));

    await expect.element(page.getByTestId('result')).toHaveTextContent('0');
  });
});
