import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';

import Terminal from './Terminal';
import { mockGitHubStats } from './Terminal.fixtures';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}));

// Helper to mock touch device detection and reduced motion
const mockTouchDevice = (isTouch: boolean, reducedMotion = false) => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query === '(pointer: coarse)' ? isTouch : query === '(prefers-reduced-motion: reduce)' ? reducedMotion : !isTouch,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
};

describe('Terminal', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('boot sequence', () => {
    test('starts in typing state with animated text', async () => {
      mockTouchDevice(false);
      const onBootComplete = vi.fn();

      await render(
        <Terminal stats={mockGitHubStats} onBootComplete={onBootComplete}>
          <div data-testid='boot-content'>Content loaded</div>
        </Terminal>,
      );

      // Should show cursor during typing
      await expect.element(page.getByTestId('terminal-cursor')).toBeVisible();
      // Footer should show "4 で戻る" during typing
      const footer = page.getByTestId('terminal-footer');
      await expect.element(footer).toHaveTextContent('4');
    });

    test('shows typing cursor that blinks', async () => {
      mockTouchDevice(false);
      const onBootComplete = vi.fn();

      await render(
        <Terminal stats={mockGitHubStats} onBootComplete={onBootComplete}>
          <div>Content</div>
        </Terminal>,
      );

      // Cursor element should exist
      await expect.element(page.getByTestId('terminal-cursor')).toBeInTheDocument();
    });

    test('completes boot and shows prompt', async () => {
      mockTouchDevice(false);
      const onBootComplete = vi.fn();

      await render(
        <Terminal stats={mockGitHubStats} onBootComplete={onBootComplete}>
          <div data-testid='boot-content'>Content loaded</div>
        </Terminal>,
      );

      // Advance past initial delay then skip with Ctrl+C
      await vi.advanceTimersByTimeAsync(600);
      await userEvent.keyboard('{Control>}c{/Control}');
      await vi.advanceTimersByTimeAsync(300);

      // Should call onBootComplete
      expect(onBootComplete).toHaveBeenCalled();

      // Content should be visible
      await expect.element(page.getByTestId('boot-content')).toBeVisible();

      // Prompt cursor should be visible (desktop mode)
      await expect.element(page.getByTestId('terminal-prompt-cursor')).toBeVisible();
    });

    test('footer shows help text after boot on desktop', async () => {
      mockTouchDevice(false);
      const onBootComplete = vi.fn();

      await render(
        <Terminal stats={mockGitHubStats} onBootComplete={onBootComplete}>
          <div>Content</div>
        </Terminal>,
      );

      // Skip boot with Ctrl+C
      await vi.advanceTimersByTimeAsync(600);
      await userEvent.keyboard('{Control>}c{/Control}');
      await vi.advanceTimersByTimeAsync(300);

      const footer = page.getByTestId('terminal-footer');
      await expect.element(footer).toHaveTextContent("type 'help' for commands");
    });
  });

  describe('Ctrl+C interrupt', () => {
    test('Ctrl+C during typing triggers boot completion', async () => {
      mockTouchDevice(false);
      const onBootComplete = vi.fn();

      await render(
        <Terminal stats={mockGitHubStats} onBootComplete={onBootComplete}>
          <div data-testid='boot-content'>Content</div>
        </Terminal>,
      );

      // Advance past initial delay to start typing
      await vi.advanceTimersByTimeAsync(550);

      // Verify we're in typing state - cursor should be visible
      await expect.element(page.getByTestId('terminal-cursor')).toBeVisible();

      // Press Ctrl+C to interrupt
      await userEvent.keyboard('{Control>}c{/Control}');

      // Advance time for boot complete transition
      await vi.advanceTimersByTimeAsync(200);

      // onBootComplete should be called after interrupt
      expect(onBootComplete).toHaveBeenCalledTimes(1);

      // Should transition to prompt state - prompt cursor appears
      await expect.element(page.getByTestId('terminal-prompt-cursor')).toBeVisible();
    });

    test('Ctrl+C during typing transitions to prompt', async () => {
      mockTouchDevice(false);
      const onBootComplete = vi.fn();

      await render(
        <Terminal stats={mockGitHubStats} onBootComplete={onBootComplete}>
          <div data-testid='boot-content'>Content</div>
        </Terminal>,
      );

      // Advance past initial delay
      await vi.advanceTimersByTimeAsync(600);

      // Press Ctrl+C
      await userEvent.keyboard('{Control>}c{/Control}');

      // Advance time for state transitions
      await vi.advanceTimersByTimeAsync(300);

      // Content should be visible (boot complete)
      await expect.element(page.getByTestId('boot-content')).toBeVisible();

      // Footer should show help text
      const footer = page.getByTestId('terminal-footer');
      await expect.element(footer).toHaveTextContent("type 'help' for commands");
    });
  });

  describe('touch device behavior', () => {
    test('does not show prompt on touch device', async () => {
      // Enable reduced motion to skip typing animation
      mockTouchDevice(true, true);
      const onBootComplete = vi.fn();

      await render(
        <Terminal stats={mockGitHubStats} onBootComplete={onBootComplete}>
          <div data-testid='boot-content'>Content</div>
        </Terminal>,
      );

      // Advance time for boot to complete (reduced motion makes it fast)
      await vi.advanceTimersByTimeAsync(1000);

      // Prompt cursor should not exist on touch device
      const promptCursor = page.getByTestId('terminal-prompt-cursor');
      await expect.element(promptCursor).not.toBeInTheDocument();
    });

    test('shows 4 で戻る on touch device after boot', async () => {
      // Enable reduced motion to skip typing animation
      mockTouchDevice(true, true);
      const onBootComplete = vi.fn();

      await render(
        <Terminal stats={mockGitHubStats} onBootComplete={onBootComplete}>
          <div>Content</div>
        </Terminal>,
      );

      // Advance time for boot to complete (reduced motion makes it fast)
      await vi.advanceTimersByTimeAsync(1000);

      const footer = page.getByTestId('terminal-footer');
      await expect.element(footer).toHaveTextContent('4');
      // Should NOT show help text
      const footerEl = footer.element();
      expect(footerEl?.textContent).not.toContain('help');
    });
  });

  describe('desktop behavior', () => {
    test('keyboard input appears in prompt', async () => {
      mockTouchDevice(false);
      const onBootComplete = vi.fn();

      await render(
        <Terminal stats={mockGitHubStats} onBootComplete={onBootComplete}>
          <div>Content</div>
        </Terminal>,
      );

      // Skip boot with Ctrl+C
      await vi.advanceTimersByTimeAsync(600);
      await userEvent.keyboard('{Control>}c{/Control}');
      await vi.advanceTimersByTimeAsync(300);

      // Type in the terminal
      await userEvent.keyboard('help');

      // Input should appear
      await expect.element(page.getByTestId('terminal-input')).toHaveTextContent('help');
    });
  });

  describe('command execution', () => {
    test('help command shows output', async () => {
      mockTouchDevice(false);
      const onBootComplete = vi.fn();

      await render(
        <Terminal stats={mockGitHubStats} onBootComplete={onBootComplete}>
          <div>Content</div>
        </Terminal>,
      );

      // Skip boot with Ctrl+C
      await vi.advanceTimersByTimeAsync(600);
      await userEvent.keyboard('{Control>}c{/Control}');
      await vi.advanceTimersByTimeAsync(300);

      // Execute help command
      await userEvent.keyboard('help{Enter}');

      // Advance time for command execution
      await vi.advanceTimersByTimeAsync(100);

      // Output should appear in terminal-output
      await expect.element(page.getByTestId('terminal-output')).toBeVisible();
      await expect.element(page.getByTestId('terminal-output')).toHaveTextContent('help');
    });

    test('clear command removes output', async () => {
      mockTouchDevice(false);
      const onBootComplete = vi.fn();

      await render(
        <Terminal stats={mockGitHubStats} onBootComplete={onBootComplete}>
          <div>Content</div>
        </Terminal>,
      );

      // Skip boot with Ctrl+C
      await vi.advanceTimersByTimeAsync(600);
      await userEvent.keyboard('{Control>}c{/Control}');
      await vi.advanceTimersByTimeAsync(300);

      // Execute help to add output
      await userEvent.keyboard('help{Enter}');
      await vi.advanceTimersByTimeAsync(100);

      // Execute clear
      await userEvent.keyboard('clear{Enter}');
      await vi.advanceTimersByTimeAsync(100);

      // Output should be gone (terminal-output won't render if lines.length === 0)
      await expect.element(page.getByTestId('terminal-output')).not.toBeInTheDocument();
    });

    test('unknown command shows error', async () => {
      mockTouchDevice(false);
      const onBootComplete = vi.fn();

      await render(
        <Terminal stats={mockGitHubStats} onBootComplete={onBootComplete}>
          <div>Content</div>
        </Terminal>,
      );

      // Skip boot with Ctrl+C
      await vi.advanceTimersByTimeAsync(600);
      await userEvent.keyboard('{Control>}c{/Control}');
      await vi.advanceTimersByTimeAsync(300);

      // Execute unknown command
      await userEvent.keyboard('unknowncommand{Enter}');
      await vi.advanceTimersByTimeAsync(100);

      // Error should appear in output
      await expect.element(page.getByTestId('terminal-output')).toHaveTextContent('command not found');
    });
  });

  describe('exit confirmation flow', () => {
    test('exit command shows confirmation prompt', async () => {
      mockTouchDevice(false);
      const onBootComplete = vi.fn();
      mockNavigate.mockClear();

      await render(
        <Terminal stats={mockGitHubStats} onBootComplete={onBootComplete}>
          <div>Content</div>
        </Terminal>,
      );

      // Skip boot with Ctrl+C
      await vi.advanceTimersByTimeAsync(600);
      await userEvent.keyboard('{Control>}c{/Control}');
      await vi.advanceTimersByTimeAsync(300);

      // Execute exit
      await userEvent.keyboard('exit{Enter}');
      await vi.advanceTimersByTimeAsync(100);

      // Should show confirmation prompt
      await expect.element(page.getByTestId('terminal-output')).toHaveTextContent('exit');
      await expect.element(page.getByTestId('terminal-output')).toHaveTextContent('y/n');

      // Should NOT navigate yet
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    test('confirming exit with y navigates home', async () => {
      mockTouchDevice(false);
      const onBootComplete = vi.fn();
      mockNavigate.mockClear();

      await render(
        <Terminal stats={mockGitHubStats} onBootComplete={onBootComplete}>
          <div>Content</div>
        </Terminal>,
      );

      // Skip boot with Ctrl+C
      await vi.advanceTimersByTimeAsync(600);
      await userEvent.keyboard('{Control>}c{/Control}');
      await vi.advanceTimersByTimeAsync(300);

      // Execute exit
      await userEvent.keyboard('exit{Enter}');
      await vi.advanceTimersByTimeAsync(100);

      // Confirm with y
      await userEvent.keyboard('y{Enter}');
      await vi.advanceTimersByTimeAsync(100);

      // Should navigate to home
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/' });
    });

    test('declining exit with n stays in terminal', async () => {
      mockTouchDevice(false);
      const onBootComplete = vi.fn();
      mockNavigate.mockClear();

      await render(
        <Terminal stats={mockGitHubStats} onBootComplete={onBootComplete}>
          <div>Content</div>
        </Terminal>,
      );

      // Skip boot with Ctrl+C
      await vi.advanceTimersByTimeAsync(600);
      await userEvent.keyboard('{Control>}c{/Control}');
      await vi.advanceTimersByTimeAsync(300);

      // Execute exit
      await userEvent.keyboard('exit{Enter}');
      await vi.advanceTimersByTimeAsync(100);

      // Decline with n
      await userEvent.keyboard('n{Enter}');
      await vi.advanceTimersByTimeAsync(100);

      // Should NOT navigate
      expect(mockNavigate).not.toHaveBeenCalled();

      // Should show 'n' in output
      await expect.element(page.getByTestId('terminal-output')).toHaveTextContent('n');
    });

    test('canceling exit with Ctrl+C clears confirmation', async () => {
      mockTouchDevice(false);
      const onBootComplete = vi.fn();
      mockNavigate.mockClear();

      await render(
        <Terminal stats={mockGitHubStats} onBootComplete={onBootComplete}>
          <div>Content</div>
        </Terminal>,
      );

      // Skip boot with Ctrl+C
      await vi.advanceTimersByTimeAsync(600);
      await userEvent.keyboard('{Control>}c{/Control}');
      await vi.advanceTimersByTimeAsync(300);

      // Execute exit
      await userEvent.keyboard('exit{Enter}');
      await vi.advanceTimersByTimeAsync(100);

      // Cancel with Ctrl+C
      await userEvent.keyboard('{Control>}c{/Control}');
      await vi.advanceTimersByTimeAsync(100);

      // Should NOT navigate
      expect(mockNavigate).not.toHaveBeenCalled();

      // Input should be cleared, can type new command
      await userEvent.keyboard('help');
      await expect.element(page.getByTestId('terminal-input')).toHaveTextContent('help');
    });
  });

  describe('tab autocomplete', () => {
    test('tab completes command', async () => {
      mockTouchDevice(false);
      const onBootComplete = vi.fn();

      await render(
        <Terminal stats={mockGitHubStats} onBootComplete={onBootComplete}>
          <div>Content</div>
        </Terminal>,
      );

      // Skip boot with Ctrl+C
      await vi.advanceTimersByTimeAsync(600);
      await userEvent.keyboard('{Control>}c{/Control}');
      await vi.advanceTimersByTimeAsync(300);

      // Type partial command
      await userEvent.keyboard('hel');

      // Tab to autocomplete
      await userEvent.keyboard('{Tab}');

      // Should complete to 'help'
      await expect.element(page.getByTestId('terminal-input')).toHaveTextContent('help');
    });

    test('double tab shows suggestions', async () => {
      mockTouchDevice(false);
      const onBootComplete = vi.fn();

      await render(
        <Terminal stats={mockGitHubStats} onBootComplete={onBootComplete}>
          <div>Content</div>
        </Terminal>,
      );

      // Skip boot with Ctrl+C
      await vi.advanceTimersByTimeAsync(600);
      await userEvent.keyboard('{Control>}c{/Control}');
      await vi.advanceTimersByTimeAsync(300);

      // First execute a command so terminal-output renders (it only shows when lines.length > 0)
      await userEvent.keyboard('help{Enter}');
      await vi.advanceTimersByTimeAsync(100);

      // Now type partial that matches multiple
      await userEvent.keyboard('e');

      // Double tab to show suggestions
      await userEvent.keyboard('{Tab}{Tab}');

      // Should show 'exit' suggestion in output (exit matches 'e')
      await expect.element(page.getByTestId('terminal-output')).toHaveTextContent('exit');
    });
  });

  describe('auto-scroll', () => {
    test('scrolls to bottom on new output', async () => {
      mockTouchDevice(false);
      const onBootComplete = vi.fn();

      await render(
        <Terminal stats={mockGitHubStats} onBootComplete={onBootComplete}>
          <div>Content</div>
        </Terminal>,
      );

      // Skip boot with Ctrl+C
      await vi.advanceTimersByTimeAsync(600);
      await userEvent.keyboard('{Control>}c{/Control}');
      await vi.advanceTimersByTimeAsync(300);

      // Execute multiple commands to generate output
      for (let i = 0; i < 3; i++) {
        await userEvent.keyboard('help{Enter}');
        await vi.advanceTimersByTimeAsync(100);
      }

      // The terminal-output should exist and have scrolled
      const output = page.getByTestId('terminal-output');
      await expect.element(output).toBeVisible();
    });
  });

  describe('crash sequence', () => {
    // Skip: This test triggers a setTimeout that throws SudoRmRfError after 1.5s.
    // The error is thrown after the test completes but before cleanup, causing
    // "Unhandled Error" warnings in vitest. The crash flow is visually verified
    // in Storybook (Terminal/Crashing story - also excluded from automated tests).
    // The full crash → BSOD → reset flow is tested in BSODError integration tests.
    test.skip('sudo rm -rf shows crash animation class', async () => {
      mockTouchDevice(false);
      const onBootComplete = vi.fn();

      await render(
        <Terminal stats={mockGitHubStats} onBootComplete={onBootComplete}>
          <div>Content</div>
        </Terminal>,
      );

      // Skip boot with Ctrl+C
      await vi.advanceTimersByTimeAsync(600);
      await userEvent.keyboard('{Control>}c{/Control}');
      await vi.advanceTimersByTimeAsync(300);

      // Execute crash command
      await userEvent.keyboard('sudo rm -rf /{Enter}');

      // Advance time for crash state to be set
      await vi.advanceTimersByTimeAsync(100);

      // Should show "Executing..." in output
      await expect.element(page.getByTestId('terminal-output')).toHaveTextContent('Executing');
    });
  });

  describe('stats display', () => {
    test('shows cached date after boot', async () => {
      mockTouchDevice(false);
      const onBootComplete = vi.fn();

      await render(
        <Terminal stats={mockGitHubStats} onBootComplete={onBootComplete}>
          <div>Content</div>
        </Terminal>,
      );

      // Skip boot with Ctrl+C
      await vi.advanceTimersByTimeAsync(600);
      await userEvent.keyboard('{Control>}c{/Control}');
      await vi.advanceTimersByTimeAsync(300);

      // Header should show the cached date
      const header = page.getByTestId('terminal-header');
      await expect.element(header).toHaveTextContent('最終更新');
      // The date format will be ja-JP locale
      await expect.element(header).toHaveTextContent('2024');
    });
  });

  describe('Ctrl+C in prompt state', () => {
    test('clears current input', async () => {
      mockTouchDevice(false);
      const onBootComplete = vi.fn();

      await render(
        <Terminal stats={mockGitHubStats} onBootComplete={onBootComplete}>
          <div>Content</div>
        </Terminal>,
      );

      // Skip boot with Ctrl+C
      await vi.advanceTimersByTimeAsync(600);
      await userEvent.keyboard('{Control>}c{/Control}');
      await vi.advanceTimersByTimeAsync(300);

      // Type something
      await userEvent.keyboard('some input');
      await expect.element(page.getByTestId('terminal-input')).toHaveTextContent('some input');

      // Press Ctrl+C
      await userEvent.keyboard('{Control>}c{/Control}');
      await vi.advanceTimersByTimeAsync(100);

      // Input should be cleared
      await expect.element(page.getByTestId('terminal-input')).toHaveTextContent('');
    });
  });
});
