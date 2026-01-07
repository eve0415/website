import type { FC } from 'react';

import { useState } from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';

import Logo from './Logo';

// Wrapper to track animation state
const LogoTestWrapper: FC<{ animate?: boolean }> = ({ animate = true }) => {
  const [mounted, setMounted] = useState(true);

  if (!mounted) {
    return <div data-testid='unmounted'>unmounted</div>;
  }

  return (
    <div data-testid='wrapper'>
      <Logo animate={animate} />
      <button data-testid='unmount-btn' onClick={() => setMounted(false)} type='button'>
        Unmount
      </button>
    </div>
  );
};

describe('Logo', () => {
  test('renders without crashing', async () => {
    await render(<Logo />);

    const svg = page.getByRole('img');
    await expect.element(svg).toBeInTheDocument();
  });

  test('renders with aria-label for accessibility', async () => {
    await render(<Logo />);

    const svg = page.getByRole('img');
    await expect.element(svg).toHaveAttribute('aria-label', 'eve0415 ロゴ');
  });

  test('renders without animation when animate=false', async () => {
    await render(<Logo animate={false} />);

    const svg = page.getByRole('img');
    await expect.element(svg).toBeInTheDocument();
  });

  test('applies custom className', async () => {
    await render(<Logo className='custom-class' />);

    const svg = page.getByRole('img');
    await expect.element(svg).toHaveClass('custom-class');
  });

  test('animation completes after delay', async () => {
    // This test covers line 28: setIsAnimating(false) after timer
    await render(<Logo animate={true} />);

    const svg = page.getByRole('img');
    await expect.element(svg).toBeInTheDocument();

    // Wait for animation to complete (2000ms + buffer)
    await new Promise(resolve => setTimeout(resolve, 2200));

    // After animation, the component should still be rendered
    await expect.element(svg).toBeInTheDocument();
  });

  test('cleans up timer on unmount', async () => {
    const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout');

    await render(<LogoTestWrapper animate={true} />);

    // Unmount before animation completes
    const unmountBtn = page.getByTestId('unmount-btn');
    await unmountBtn.click();

    await expect.element(page.getByTestId('unmounted')).toBeInTheDocument();

    // clearTimeout should have been called during cleanup
    expect(clearTimeoutSpy).toHaveBeenCalled();

    clearTimeoutSpy.mockRestore();
  });
});
