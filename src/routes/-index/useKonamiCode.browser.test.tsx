/* oxlint-disable eslint(no-await-in-loop) -- Sequential keyboard input tests require await in loop */
import type { FC } from 'react';

import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';

import { useKonamiCode } from './useKonamiCode';

const KONAMI_CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];

interface TestComponentProps {
  onActivate?: () => void;
}

const TestComponent: FC<TestComponentProps> = ({ onActivate }) => {
  const isActivated = useKonamiCode(onActivate);
  return <div data-testid='result'>{String(isActivated)}</div>;
};

describe('useKonamiCode', () => {
  test('returns false initially', async () => {
    await render(<TestComponent />);

    await expect.element(page.getByTestId('result')).toHaveTextContent('false');
  });

  test('activates after correct sequence', async () => {
    const onActivate = vi.fn();
    await render(<TestComponent onActivate={onActivate} />);

    await expect.element(page.getByTestId('result')).toHaveTextContent('false');

    // Input the Konami Code
    for (const key of KONAMI_CODE) await userEvent.keyboard(`{${key}}`);

    await expect.element(page.getByTestId('result')).toHaveTextContent('true');
    expect(onActivate).toHaveBeenCalledOnce();
  });

  test('does not activate on partial sequence', async () => {
    const onActivate = vi.fn();
    await render(<TestComponent onActivate={onActivate} />);

    // Input only first 5 keys
    for (let i = 0; i < 5; i++) await userEvent.keyboard(`{${KONAMI_CODE[i]}}`);

    await expect.element(page.getByTestId('result')).toHaveTextContent('false');
    expect(onActivate).not.toHaveBeenCalled();
  });

  test('does not activate when wrong key interrupts sequence', async () => {
    const onActivate = vi.fn();
    await render(<TestComponent onActivate={onActivate} />);

    // Input 5 correct keys
    for (let i = 0; i < 5; i++) await userEvent.keyboard(`{${KONAMI_CODE[i]}}`);

    // Input wrong key
    await userEvent.keyboard('{KeyX}');

    // Continue with rest of sequence
    for (let i = 5; i < KONAMI_CODE.length; i++) await userEvent.keyboard(`{${KONAMI_CODE[i]}}`);

    await expect.element(page.getByTestId('result')).toHaveTextContent('false');
    expect(onActivate).not.toHaveBeenCalled();
  });

  test('activates after correct sequence despite wrong keys before', async () => {
    const onActivate = vi.fn();
    await render(<TestComponent onActivate={onActivate} />);

    // Input some wrong keys
    await userEvent.keyboard('{KeyX}');
    await userEvent.keyboard('{KeyY}');
    await userEvent.keyboard('{KeyZ}');

    // Then input correct sequence
    for (const key of KONAMI_CODE) await userEvent.keyboard(`{${key}}`);

    await expect.element(page.getByTestId('result')).toHaveTextContent('true');
    expect(onActivate).toHaveBeenCalledOnce();
  });

  test('does not re-trigger after activation', async () => {
    const onActivate = vi.fn();
    await render(<TestComponent onActivate={onActivate} />);

    // Input the Konami Code
    for (const key of KONAMI_CODE) await userEvent.keyboard(`{${key}}`);

    await expect.element(page.getByTestId('result')).toHaveTextContent('true');
    expect(onActivate).toHaveBeenCalledOnce();

    // Try to activate again
    for (const key of KONAMI_CODE) await userEvent.keyboard(`{${key}}`);

    // Still only called once
    expect(onActivate).toHaveBeenCalledOnce();
  });

  test('works without onActivate callback', async () => {
    await render(<TestComponent />);

    for (const key of KONAMI_CODE) await userEvent.keyboard(`{${key}}`);

    await expect.element(page.getByTestId('result')).toHaveTextContent('true');
  });

  test('maintains buffer of last 10 keys', async () => {
    const onActivate = vi.fn();
    await render(<TestComponent onActivate={onActivate} />);

    // Input 15 random keys (exceeds buffer size)
    for (let i = 0; i < 15; i++) await userEvent.keyboard('{KeyX}');

    // Now input the correct sequence
    for (const key of KONAMI_CODE) await userEvent.keyboard(`{${key}}`);

    await expect.element(page.getByTestId('result')).toHaveTextContent('true');
    expect(onActivate).toHaveBeenCalledOnce();
  });
});
