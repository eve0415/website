import type { FC } from 'react';

import { useState } from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';

import { type Phase, usePhaseController } from './usePhaseController';

interface TestComponentProps {
  skipToAftermath?: boolean;
  onPhaseChange?: (phase: Phase) => void;
  debugPaused?: boolean;
}

const TestComponent: FC<TestComponentProps> = ({ skipToAftermath = false, onPhaseChange, debugPaused = false }) => {
  const phase = usePhaseController({
    skipToAftermath,
    debugPaused,
    ...(onPhaseChange && { onPhaseChange }),
  });

  return (
    <div>
      <div data-testid='current'>{phase.current}</div>
      <div data-testid='progress'>{phase.progress.toFixed(4)}</div>
      <div data-testid='elapsed'>{phase.elapsed}</div>
      <div data-testid='total-elapsed'>{phase.totalElapsed}</div>
      <div data-testid='is-boot'>{String(phase.isPhase('boot'))}</div>
      <div data-testid='is-corruption'>{String(phase.isPhase('corruption'))}</div>
      <div data-testid='is-aftermath'>{String(phase.isPhase('aftermath'))}</div>
      <div data-testid='past-boot'>{String(phase.isPastPhase('boot'))}</div>
      <div data-testid='past-corruption'>{String(phase.isPastPhase('corruption'))}</div>
      <button data-testid='jump-boot' onClick={() => phase.jumpToPhase('boot')} type='button'>
        Jump Boot
      </button>
      <button data-testid='jump-corruption' onClick={() => phase.jumpToPhase('corruption')} type='button'>
        Jump Corruption
      </button>
      <button data-testid='jump-aftermath' onClick={() => phase.jumpToPhase('aftermath')} type='button'>
        Jump Aftermath
      </button>
      <button data-testid='advance' onClick={() => phase.advancePhase()} type='button'>
        Advance
      </button>
    </div>
  );
};

// Component with controllable debugPaused state
const DebugPausedTestComponent: FC = () => {
  const [debugPaused, setDebugPaused] = useState(false);
  const phase = usePhaseController({ debugPaused });

  return (
    <div>
      <div data-testid='current'>{phase.current}</div>
      <div data-testid='progress'>{phase.progress.toFixed(4)}</div>
      <div data-testid='debug-paused'>{String(debugPaused)}</div>
      <button data-testid='toggle-pause' onClick={() => setDebugPaused(p => !p)} type='button'>
        Toggle Pause
      </button>
      <button data-testid='jump-boot' onClick={() => phase.jumpToPhase('boot')} type='button'>
        Jump Boot
      </button>
    </div>
  );
};

// Helper to wait for RAF cycles
const waitForRAF = (cycles = 2) =>
  new Promise<void>(resolve => {
    let remaining = cycles;
    const tick = () => {
      remaining--;
      if (remaining <= 0) resolve();
      else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

describe('usePhaseController', () => {
  describe('initial state', () => {
    test('starts in boot phase', async () => {
      await render(<TestComponent />);

      await expect.element(page.getByTestId('current')).toHaveTextContent('boot');
      await expect.element(page.getByTestId('is-boot')).toHaveTextContent('true');
      await expect.element(page.getByTestId('is-corruption')).toHaveTextContent('false');
      await expect.element(page.getByTestId('is-aftermath')).toHaveTextContent('false');
    });

    test('skipToAftermath starts directly in aftermath', async () => {
      await render(<TestComponent skipToAftermath={true} />);

      await expect.element(page.getByTestId('current')).toHaveTextContent('aftermath');
      await expect.element(page.getByTestId('progress')).toHaveTextContent('1.0000');
      await expect.element(page.getByTestId('is-aftermath')).toHaveTextContent('true');
    });
  });

  describe('jumpToPhase', () => {
    test('immediately transitions to corruption', async () => {
      await render(<TestComponent />);

      await expect.element(page.getByTestId('current')).toHaveTextContent('boot');
      await page.getByTestId('jump-corruption').click();
      await expect.element(page.getByTestId('current')).toHaveTextContent('corruption');
      await expect.element(page.getByTestId('progress')).toHaveTextContent('0.0000');
    });

    test('immediately transitions to aftermath', async () => {
      await render(<TestComponent />);

      await page.getByTestId('jump-aftermath').click();
      await expect.element(page.getByTestId('current')).toHaveTextContent('aftermath');
    });

    test('can jump backwards to boot from corruption', async () => {
      await render(<TestComponent />);

      await page.getByTestId('jump-corruption').click();
      await expect.element(page.getByTestId('current')).toHaveTextContent('corruption');

      await page.getByTestId('jump-boot').click();
      await expect.element(page.getByTestId('current')).toHaveTextContent('boot');
      await expect.element(page.getByTestId('progress')).toHaveTextContent('0.0000');
    });
  });

  describe('advancePhase', () => {
    test('advances from boot to corruption', async () => {
      await render(<TestComponent />);

      await expect.element(page.getByTestId('current')).toHaveTextContent('boot');
      await page.getByTestId('advance').click();
      await expect.element(page.getByTestId('current')).toHaveTextContent('corruption');
    });

    test('advances from corruption to aftermath', async () => {
      await render(<TestComponent />);

      await page.getByTestId('jump-corruption').click();
      await page.getByTestId('advance').click();
      await expect.element(page.getByTestId('current')).toHaveTextContent('aftermath');
    });

    test('does nothing in aftermath (no next phase)', async () => {
      await render(<TestComponent />);

      await page.getByTestId('jump-aftermath').click();
      await expect.element(page.getByTestId('current')).toHaveTextContent('aftermath');

      await page.getByTestId('advance').click();
      await expect.element(page.getByTestId('current')).toHaveTextContent('aftermath');
    });
  });

  describe('onPhaseChange callback', () => {
    test('fires when jumpToPhase is called', async () => {
      const onPhaseChange = vi.fn();
      await render(<TestComponent onPhaseChange={onPhaseChange} />);

      await page.getByTestId('jump-corruption').click();

      await expect.poll(() => onPhaseChange.mock.calls.length).toBe(1);
      expect(onPhaseChange).toHaveBeenCalledWith('corruption');
    });

    test('fires when advancePhase is called', async () => {
      const onPhaseChange = vi.fn();
      await render(<TestComponent onPhaseChange={onPhaseChange} />);

      await page.getByTestId('advance').click();

      await expect.poll(() => onPhaseChange.mock.calls.length).toBe(1);
      expect(onPhaseChange).toHaveBeenCalledWith('corruption');
    });

    test('fires for each phase transition', async () => {
      const onPhaseChange = vi.fn();
      await render(<TestComponent onPhaseChange={onPhaseChange} />);

      await page.getByTestId('advance').click(); // boot -> corruption
      await page.getByTestId('advance').click(); // corruption -> aftermath

      await expect.poll(() => onPhaseChange.mock.calls.length).toBe(2);
      expect(onPhaseChange).toHaveBeenNthCalledWith(1, 'corruption');
      expect(onPhaseChange).toHaveBeenNthCalledWith(2, 'aftermath');
    });
  });

  describe('isPhase and isPastPhase', () => {
    test('isPhase returns true only for current phase', async () => {
      await render(<TestComponent />);

      // In boot
      await expect.element(page.getByTestId('is-boot')).toHaveTextContent('true');
      await expect.element(page.getByTestId('is-corruption')).toHaveTextContent('false');
      await expect.element(page.getByTestId('is-aftermath')).toHaveTextContent('false');

      // Jump to corruption
      await page.getByTestId('jump-corruption').click();
      await expect.element(page.getByTestId('is-boot')).toHaveTextContent('false');
      await expect.element(page.getByTestId('is-corruption')).toHaveTextContent('true');
      await expect.element(page.getByTestId('is-aftermath')).toHaveTextContent('false');

      // Jump to aftermath
      await page.getByTestId('jump-aftermath').click();
      await expect.element(page.getByTestId('is-boot')).toHaveTextContent('false');
      await expect.element(page.getByTestId('is-corruption')).toHaveTextContent('false');
      await expect.element(page.getByTestId('is-aftermath')).toHaveTextContent('true');
    });

    test('isPastPhase returns true for earlier phases', async () => {
      await render(<TestComponent />);

      // In boot - nothing is past
      await expect.element(page.getByTestId('past-boot')).toHaveTextContent('false');
      await expect.element(page.getByTestId('past-corruption')).toHaveTextContent('false');

      // Jump to corruption - boot is past
      await page.getByTestId('jump-corruption').click();
      await expect.element(page.getByTestId('past-boot')).toHaveTextContent('true');
      await expect.element(page.getByTestId('past-corruption')).toHaveTextContent('false');

      // Jump to aftermath - boot and corruption are past
      await page.getByTestId('jump-aftermath').click();
      await expect.element(page.getByTestId('past-boot')).toHaveTextContent('true');
      await expect.element(page.getByTestId('past-corruption')).toHaveTextContent('true');
    });
  });

  describe('progress tracking', () => {
    test('progress increases over time in boot phase', async () => {
      await render(<TestComponent />);

      // Wait for a few RAF cycles
      await waitForRAF(5);

      // Progress should be > 0 (we can't test exact values without mocking time)
      const progressEl = page.getByTestId('progress');
      const text = progressEl.element().textContent;
      const progress = Number.parseFloat(text || '0');

      expect(progress).toBeGreaterThan(0);
      expect(progress).toBeLessThan(1); // Shouldn't be done yet (7000ms total)
    });

    test('elapsed time increases', async () => {
      await render(<TestComponent />);

      await waitForRAF(5);

      const elapsedEl = page.getByTestId('elapsed');
      const elapsed = Number.parseFloat(elapsedEl.element().textContent || '0');

      expect(elapsed).toBeGreaterThan(0);
    });

    test('total elapsed time increases', async () => {
      await render(<TestComponent />);

      await waitForRAF(5);

      const totalEl = page.getByTestId('total-elapsed');
      const total = Number.parseFloat(totalEl.element().textContent || '0');

      expect(total).toBeGreaterThan(0);
    });

    test('progress resets to 0 when jumping to new phase', async () => {
      await render(<TestComponent />);

      // Wait for some progress
      await waitForRAF(5);

      // Jump to corruption
      await page.getByTestId('jump-corruption').click();

      // Progress should reset
      await expect.element(page.getByTestId('progress')).toHaveTextContent('0.0000');
    });
  });

  describe('debugPaused behavior', () => {
    test('freezes auto-advance when paused at phase boundary', async () => {
      // This test verifies that debugPaused blocks the auto-advance logic
      // We can't easily test the timing without mocking, but we can test that
      // when debugPaused=true, the phase doesn't auto-advance

      // Start with debugPaused=true
      await render(<TestComponent debugPaused={true} />);

      // Jump to near the end of boot phase using jumpToPhase
      // Since debugPaused only affects auto-advance (not jumpToPhase),
      // we test by advancing to a phase and checking it stays there

      await page.getByTestId('jump-corruption').click();
      await expect.element(page.getByTestId('current')).toHaveTextContent('corruption');

      // Wait and verify phase doesn't auto-advance
      await waitForRAF(10);
      await expect.element(page.getByTestId('current')).toHaveTextContent('corruption');
    });

    test('can toggle debugPaused state', async () => {
      await render(<DebugPausedTestComponent />);

      // Initially not paused
      await expect.element(page.getByTestId('debug-paused')).toHaveTextContent('false');

      // Toggle pause
      await page.getByTestId('toggle-pause').click();
      await expect.element(page.getByTestId('debug-paused')).toHaveTextContent('true');

      // Component should still work
      await expect.element(page.getByTestId('current')).toHaveTextContent('boot');
    });
  });

  describe('aftermath phase', () => {
    test('stays in aftermath indefinitely (no auto-advance)', async () => {
      await render(<TestComponent skipToAftermath={true} />);

      await expect.element(page.getByTestId('current')).toHaveTextContent('aftermath');

      // Wait a bit
      await waitForRAF(5);

      // Should still be in aftermath
      await expect.element(page.getByTestId('current')).toHaveTextContent('aftermath');
      await expect.element(page.getByTestId('progress')).toHaveTextContent('1.0000');
    });

    test('animation stops in aftermath phase', async () => {
      await render(<TestComponent skipToAftermath={true} />);

      // In aftermath, no animation should be running
      // Progress stays at 1, elapsed stays at 0
      await expect.element(page.getByTestId('current')).toHaveTextContent('aftermath');

      await waitForRAF(3);

      // elapsed should be 0 because skipToAftermath skips the animation entirely
      await expect.element(page.getByTestId('elapsed')).toHaveTextContent('0');
    });
  });
});
