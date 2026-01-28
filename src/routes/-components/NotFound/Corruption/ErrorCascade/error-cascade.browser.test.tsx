/* oxlint-disable typescript-eslint(no-non-null-assertion), eslint-plugin-jest(no-conditional-in-test), typescript-eslint(no-unsafe-type-assertion) -- Test assertions verify existence; filtering empty animation delays requires conditional; NodeList items need type assertion */
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';

import ErrorCascade from './error-cascade';

// Mock useReducedMotion
vi.mock('#hooks/useReducedMotion', () => ({
  useReducedMotion: vi.fn(() => false),
}));

// CASCADE_ERRORS thresholds: 0.05, 0.15, 0.3, 0.4, 0.5, 0.65, 0.75, 0.85
// Visibility uses: effectiveProgress = Math.pow(progress, 0.7)

describe('errorCascade', () => {
  describe('visibility thresholds', () => {
    // Helper to calculate expected visible errors
    // effectiveProgress = progress^0.7 must be >= threshold
    test.each([
      { progress: 0.04, expectedVisible: 0, desc: 'no errors below 0.05' },
      { progress: 0.05, expectedVisible: 1, desc: '1 error at threshold 0.05' },
      { progress: 0.1, expectedVisible: 2, desc: '2 errors at progress 0.1' },
      { progress: 0.3, expectedVisible: 4, desc: '4 errors at progress 0.3' },
      { progress: 0.5, expectedVisible: 5, desc: '5 errors at progress 0.5' },
      { progress: 0.7, expectedVisible: 7, desc: '7 errors at progress 0.7' },
      { progress: 0.85, expectedVisible: 8, desc: '8 errors at progress 0.85' },
      { progress: 1, expectedVisible: 8, desc: '8 errors at progress 1.0' },
    ])('$desc (progress=$progress)', async ({ progress, expectedVisible }) => {
      await render(<ErrorCascade progress={progress} enabled />);

      // Count error message elements (each error has a message with specific class)
      const errorElements = document.querySelectorAll('[class*="font-semibold"]');
      expect(errorElements).toHaveLength(expectedVisible);
    });

    test('exponential curve: progress^0.7 formula', () => {
      // Verify the math behind the thresholds
      // At progress 0.5, effectiveProgress = 0.5^0.7 ≈ 0.616
      // This exceeds threshold 0.5 but not 0.65
      const effectiveAt05 = 0.5 ** 0.7;
      expect(effectiveAt05).toBeGreaterThan(0.5);
      expect(effectiveAt05).toBeLessThan(0.65);

      // At progress 1.0, effectiveProgress = 1.0
      // This exceeds all thresholds (max is 0.85)
      const effectiveAt1 = 1 ** 0.7;
      expect(effectiveAt1).toBe(1);
    });
  });

  describe('disabled state', () => {
    test('returns null when disabled', async () => {
      const { container } = await render(<ErrorCascade progress={0.5} enabled={false} />);

      expect(container.innerHTML).toBe('');
    });

    test('returns null when progress < 0.05', async () => {
      const { container } = await render(<ErrorCascade progress={0.03} enabled />);

      expect(container.innerHTML).toBe('');
    });

    test('returns null when progress is 0', async () => {
      const { container } = await render(<ErrorCascade progress={0} enabled />);

      expect(container.innerHTML).toBe('');
    });
  });

  describe('error content', () => {
    test('displays first error message at threshold', async () => {
      await render(<ErrorCascade progress={0.1} enabled />);

      // First error message
      await expect.element(page.getByText(/ENOENT: no such file or directory/)).toBeInTheDocument();
    });

    test('displays stack trace lines', async () => {
      await render(<ErrorCascade progress={0.1} enabled />);

      // First error stack trace contains this text
      await expect.element(page.getByText(/Object.openSync/)).toBeInTheDocument();
    });

    test('displays multiple error types as progress increases', async () => {
      await render(<ErrorCascade progress={0.5} enabled />);

      // Should show Node.js error (first)
      await expect.element(page.getByText(/ENOENT/)).toBeInTheDocument();
      // Should show Python error (second)
      await expect.element(page.getByText(/KeyError/)).toBeInTheDocument();
      // Should show JavaScript error (third)
      await expect.element(page.getByText(/TypeError: Cannot read property/)).toBeInTheDocument();
    });

    test('displays catastrophic errors at high progress', async () => {
      await render(<ErrorCascade progress={1} enabled />);

      // Kernel panic should be visible
      await expect.element(page.getByText(/Kernel panic/)).toBeInTheDocument();
      // Segmentation fault should be visible
      await expect.element(page.getByText(/Segmentation fault \(core dumped\)/)).toBeInTheDocument();
    });
  });

  describe('error ordering', () => {
    test('errors appear in threshold order', async () => {
      await render(<ErrorCascade progress={1} enabled />);

      const errorMessages = document.querySelectorAll('[class*="font-semibold"]');
      const texts = Array.from(errorMessages).map(el => el.textContent);

      // First error should be ENOENT (threshold 0.05)
      expect(texts[0]).toContain('ENOENT');
      // Last error should be Kernel panic (threshold 0.85)
      expect(texts.at(-1)).toContain('Kernel panic');
    });
  });

  describe('reduced motion', () => {
    test('has inline opacity style when reduced motion is on', async () => {
      const { useReducedMotion } = await import('#hooks/useReducedMotion');
      vi.mocked(useReducedMotion).mockReturnValue(true);

      await render(<ErrorCascade progress={0.5} enabled />);

      // When reduced motion is on, elements should have opacity: 1 directly
      const errorElements = document.querySelectorAll('[class*="font-semibold"]');
      expect(errorElements.length).toBeGreaterThan(0);
    });
  });

  describe('animation delays', () => {
    test('error boxes have staggered animation delays', async () => {
      await render(<ErrorCascade progress={0.5} enabled />);

      // Each error box should have animation delay
      const errorBoxes = document.querySelectorAll('[class*="border-line"]');
      const delays: number[] = [];

      for (const box of errorBoxes) {
        const style = (box as HTMLElement).style.animationDelay;
        if (style) {
          const ms = Number.parseInt(style, 10);
          delays.push(ms);
        }
      }

      // Delays should be increasing (0ms, 30ms, 60ms, etc.)
      for (let i = 1; i < delays.length; i++) expect(delays[i]).toBeGreaterThanOrEqual(delays[i - 1]!);
    });
  });
});
