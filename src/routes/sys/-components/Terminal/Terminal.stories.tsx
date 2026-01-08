import type { GitHubStats } from '../../-utils/github-stats-utils';
import type { FC, ReactNode } from 'react';

import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import preview from '#.storybook/preview';

import Terminal from './Terminal';
import { mockGitHubStats } from './Terminal.fixtures';

// Default content displayed after boot
const DefaultContent = () => (
  <div className='rounded border border-line/30 bg-background/30 p-6'>
    <h2 className='mb-4 font-mono text-neon'>System Diagnostics</h2>
    <div className='space-y-2 font-mono text-sm text-subtle-foreground'>
      <p>User: {mockGitHubStats.user.login}</p>
      <p>Repos: {mockGitHubStats.user.totalRepos}</p>
      <p>Commits: {mockGitHubStats.contributions.totalCommits}</p>
    </div>
  </div>
);

// Wrapper component that explicitly passes __forceTouchDevice
// This ensures the prop is always passed, working around CSF Next arg passing issues
interface TerminalWrapperProps {
  stats: GitHubStats;
  children: ReactNode;
  onBootComplete: () => void;
  __forceTouchDevice?: boolean;
}

const TerminalWrapper: FC<TerminalWrapperProps> = ({ stats, children, onBootComplete, __forceTouchDevice }) => (
  // ALWAYS pass __forceTouchDevice explicitly - CSF Next may not pass boolean false correctly
  <Terminal stats={stats} onBootComplete={onBootComplete} __forceTouchDevice={__forceTouchDevice === true ? true : false}>
    {children}
  </Terminal>
);

// Shared base args for all stories - forces desktop mode since browser test env may detect as touch device
const baseArgs = {
  stats: mockGitHubStats,
  children: <DefaultContent />,
  onBootComplete: fn(),
  __forceTouchDevice: false,
};

// Mock matchMedia to simulate desktop environment
const mockDesktopMatchMedia = () => {
  if (typeof window === 'undefined') return;
  const original = window.matchMedia.bind(window);
  window.matchMedia = (query: string): MediaQueryList => {
    if (query === '(pointer: fine)') {
      return { matches: true, media: query, addEventListener: () => {}, removeEventListener: () => {} } as unknown as MediaQueryList;
    }
    if (query === '(pointer: coarse)') {
      return { matches: false, media: query, addEventListener: () => {}, removeEventListener: () => {} } as unknown as MediaQueryList;
    }
    return original(query);
  };
};

// Helper to dispatch Ctrl+C directly to window (userEvent.keyboard doesn't reach window listeners)
// Must use canvasElement's window since stories run in an iframe
// Dispatch to body, document, and window to handle different browser event routing
const dispatchCtrlC = (canvasElement: HTMLElement) => {
  const doc = canvasElement.ownerDocument;
  const win = doc.defaultView ?? window;
  const event = new KeyboardEvent('keydown', {
    key: 'c',
    code: 'KeyC',
    ctrlKey: true,
    bubbles: true,
    cancelable: true,
    composed: true,
    view: win,
  });
  // Try body first (most realistic - where real events originate)
  doc.body.dispatchEvent(event);
  // Also dispatch to document
  doc.dispatchEvent(event);
  // Also dispatch directly to window as fallback
  win.dispatchEvent(event);
};

const meta = preview.meta({
  component: TerminalWrapper,
  tags: ['autodocs'],
  args: baseArgs, // Set default args at meta level
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    stats: { control: false },
    onBootComplete: { action: 'onBootComplete' },
    __forceTouchDevice: { table: { disable: true } }, // Hide from controls
  },
  decorators: [
    Story => {
      // Force desktop mode for all stories (except TouchDevice which overrides)
      mockDesktopMatchMedia();
      return (
        <div className='min-h-dvh bg-bg-primary p-8'>
          <Story />
        </div>
      );
    },
  ],
});

/**
 * Default state - Boot sequence plays automatically
 */
export const Default = meta.story({});

/**
 * Interactive - Full boot sequence with manual controls
 * Users can type commands after boot completes
 */
export const Interactive = meta.story({
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for content to appear (displaying state)
    await waitFor(() => expect(canvas.getByText('System Diagnostics')).toBeInTheDocument(), { timeout: 10000 });

    // Press Ctrl+C to dismiss content and show prompt
    dispatchCtrlC(canvasElement);

    // Wait for prompt cursor to appear
    await waitFor(() => expect(canvas.getByTestId('terminal-prompt-cursor')).toBeInTheDocument(), { timeout: 2000 });

    // Footer should show help text
    await expect(canvas.getByTestId('terminal-footer')).toHaveTextContent("type 'help' for commands");
  },
});

/**
 * Typing state - Shows typing animation in progress
 */
export const Typing = meta.story({
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for typing cursor to appear (indicates typing state)
    await waitFor(() => expect(canvas.getByTestId('terminal-cursor')).toBeInTheDocument(), { timeout: 2000 });

    // Footer is not rendered during typing state (only in prompt state on desktop)
    void expect(canvas.queryByTestId('terminal-footer')).not.toBeInTheDocument();
  },
});

/**
 * Interrupted state - Ctrl+C during typing skips content and goes directly to prompt
 *
 * NOTE: Excluded from automated tests because synthetic KeyboardEvent dispatch
 * doesn't reliably reach window event listeners during animated states.
 * This behavior is manually verified in interactive Storybook and production.
 */
export const Interrupted = meta.story({
  tags: ['!test'],
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates Ctrl+C during typing animation. Press Ctrl+C while text is typing to skip content and go directly to prompt with ^C indicator. Excluded from automated tests due to synthetic event limitations.',
      },
    },
  },
});

/**
 * Prompt state - Ready for user input
 */
export const Prompt = meta.story({
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for content to appear (displaying state)
    await waitFor(() => expect(canvas.getByText('System Diagnostics')).toBeInTheDocument(), { timeout: 10000 });

    // Press Ctrl+C to dismiss content and show prompt
    dispatchCtrlC(canvasElement);

    // Wait for prompt cursor to appear
    await waitFor(() => expect(canvas.getByTestId('terminal-prompt-cursor')).toBeInTheDocument(), { timeout: 2000 });

    // Input area should be empty
    await expect(canvas.getByTestId('terminal-input')).toHaveTextContent('');
  },
});

/**
 * WithHistory - Terminal with command history
 */
export const WithHistory = meta.story({
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for content to appear (displaying state)
    await waitFor(() => expect(canvas.getByText('System Diagnostics')).toBeInTheDocument(), { timeout: 10000 });

    // Press Ctrl+C to dismiss content and show prompt
    dispatchCtrlC(canvasElement);

    // Wait for prompt cursor to appear
    await waitFor(() => expect(canvas.getByTestId('terminal-prompt-cursor')).toBeInTheDocument(), { timeout: 2000 });

    // Click to ensure keyboard listener is attached (webkit race condition fix)
    await userEvent.click(canvasElement);

    // Execute some commands
    await userEvent.keyboard('help{Enter}');
    await waitFor(() => expect(canvas.getByTestId('terminal-output')).toHaveTextContent('help'));

    await userEvent.keyboard('whoami{Enter}');
    await waitFor(() => expect(canvas.getByTestId('terminal-output')).toHaveTextContent('whoami'));

    await userEvent.keyboard('neofetch{Enter}');
    await waitFor(() => expect(canvas.getByTestId('terminal-output')).toHaveTextContent('neofetch'));

    // Verify output area exists with all commands
    await expect(canvas.getByTestId('terminal-output')).toBeInTheDocument();
  },
});

/**
 * AwaitingConfirmation - Exit confirmation dialog
 */
export const AwaitingConfirmation = meta.story({
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for content to appear (displaying state)
    await waitFor(() => expect(canvas.getByText('System Diagnostics')).toBeInTheDocument(), { timeout: 10000 });

    // Press Ctrl+C to dismiss content and show prompt
    dispatchCtrlC(canvasElement);

    // Wait for prompt cursor to appear
    await waitFor(() => expect(canvas.getByTestId('terminal-prompt-cursor')).toBeInTheDocument(), { timeout: 2000 });

    // Click to ensure keyboard listener is attached (webkit race condition fix)
    await userEvent.click(canvasElement);

    // Execute exit command
    await userEvent.keyboard('exit{Enter}');

    // Wait for confirmation prompt to appear
    await waitFor(() => expect(canvas.getByTestId('terminal-output')).toHaveTextContent('y/n'));

    // Should show exit command in output
    await expect(canvas.getByTestId('terminal-output')).toHaveTextContent('exit');
  },
});

/**
 * TouchDevice - Simulated touch device (no keyboard prompt)
 *
 * Uses __forceTouchDevice prop to simulate touch device behavior.
 */
export const TouchDevice = meta.story({
  args: {
    ...baseArgs,
    __forceTouchDevice: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'On touch devices, the keyboard prompt and footer are hidden. Content remains visible permanently.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for boot animation to complete (content becomes visible)
    await waitFor(() => expect(canvas.getByText('System Diagnostics')).toBeInTheDocument(), { timeout: 10000 });

    // On touch devices, prompt cursor should NOT be rendered
    void expect(canvas.queryByTestId('terminal-prompt-cursor')).not.toBeInTheDocument();

    // Footer is not rendered on touch devices (only in prompt state on desktop)
    void expect(canvas.queryByTestId('terminal-footer')).not.toBeInTheDocument();
  },
});

/**
 * CommandExecution - Shows help command output
 */
export const CommandExecution = meta.story({
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for content to appear (displaying state)
    await waitFor(() => expect(canvas.getByText('System Diagnostics')).toBeInTheDocument(), { timeout: 10000 });

    // Press Ctrl+C to dismiss content and show prompt
    dispatchCtrlC(canvasElement);

    // Wait for prompt cursor to appear
    await waitFor(() => expect(canvas.getByTestId('terminal-prompt-cursor')).toBeInTheDocument(), { timeout: 2000 });

    // Click to ensure keyboard listener is attached (webkit race condition fix)
    await userEvent.click(canvasElement);

    // Type and execute help
    await userEvent.keyboard('help{Enter}');

    // Wait for help output to appear
    await waitFor(() => expect(canvas.getByTestId('terminal-output')).toHaveTextContent('COMMANDS'));

    // Verify help output - matches actual HelpOutput component structure
    const output = canvas.getByTestId('terminal-output');
    await expect(output).toHaveTextContent('Display this help message');
    await expect(output).toHaveTextContent('Clear terminal output');
    await expect(output).toHaveTextContent('Exit diagnostic mode');
  },
});

/**
 * TabAutocomplete - Demonstrates tab completion
 */
export const TabAutocomplete = meta.story({
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for content to appear (displaying state)
    await waitFor(() => expect(canvas.getByText('System Diagnostics')).toBeInTheDocument(), { timeout: 10000 });

    // Press Ctrl+C to dismiss content and show prompt
    dispatchCtrlC(canvasElement);

    // Wait for prompt cursor to appear
    await waitFor(() => expect(canvas.getByTestId('terminal-prompt-cursor')).toBeInTheDocument(), { timeout: 2000 });

    // Click to ensure keyboard listener is attached (webkit race condition fix)
    await userEvent.click(canvasElement);

    // Type partial command
    await userEvent.keyboard('hel');
    await waitFor(() => expect(canvas.getByTestId('terminal-input')).toHaveTextContent('hel'));

    // Tab to autocomplete
    await userEvent.keyboard('{Tab}');

    // Should complete to 'help'
    await waitFor(() => expect(canvas.getByTestId('terminal-input')).toHaveTextContent('help'));
  },
});

/**
 * ErrorCommand - Shows error for unknown command
 */
export const ErrorCommand = meta.story({
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for content to appear (displaying state)
    await waitFor(() => expect(canvas.getByText('System Diagnostics')).toBeInTheDocument(), { timeout: 10000 });

    // Press Ctrl+C to dismiss content and show prompt
    dispatchCtrlC(canvasElement);

    // Wait for prompt cursor to appear
    await waitFor(() => expect(canvas.getByTestId('terminal-prompt-cursor')).toBeInTheDocument(), { timeout: 2000 });

    // Click to ensure keyboard listener is attached (webkit race condition fix)
    await userEvent.click(canvasElement);

    // Execute unknown command
    await userEvent.keyboard('unknowncommand{Enter}');

    // Wait for error to appear
    await waitFor(() => expect(canvas.getByTestId('terminal-output')).toHaveTextContent('command not found'));
  },
});

/**
 * Crashing - Sudo rm -rf command (animation only, no actual error)
 *
 * Note: This story shows the TV static animation effect triggered by the crash command.
 * The actual error throw is delayed - excluded from automated tests.
 */
export const Crashing = meta.story({
  // Skip from automated tests - intentionally throws unhandled SudoRmRfError
  tags: ['!test'],
  parameters: {
    docs: {
      description: {
        story:
          'Shows the TV static crash animation triggered by sudo rm -rf /. The actual error is thrown after 1.5s delay. This story is excluded from automated tests because it intentionally throws an error.',
      },
    },
  },
  // No play function - manual visual testing only
  // The crash command triggers after 1.5s and throws SudoRmRfError
});

/**
 * CtrlCClearsInput - Ctrl+C clears current input in prompt state
 */
export const CtrlCClearsInput = meta.story({
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for content to appear (displaying state)
    await waitFor(() => expect(canvas.getByText('System Diagnostics')).toBeInTheDocument(), { timeout: 10000 });

    // Press Ctrl+C to dismiss content and show prompt
    dispatchCtrlC(canvasElement);

    // Wait for prompt cursor to appear
    await waitFor(() => expect(canvas.getByTestId('terminal-prompt-cursor')).toBeInTheDocument(), { timeout: 2000 });

    // Click to ensure keyboard listener is attached (webkit race condition fix)
    await userEvent.click(canvasElement);

    // Type something
    await userEvent.keyboard('some partial command');
    await waitFor(() => expect(canvas.getByTestId('terminal-input')).toHaveTextContent('some partial command'));

    // Press Ctrl+C again (now in prompt state, should clear input)
    dispatchCtrlC(canvasElement);

    // Input should be cleared
    await waitFor(() => expect(canvas.getByTestId('terminal-input')).toHaveTextContent(''));
  },
});

/**
 * SysDiagnosticCommand - Re-run sys.diagnostic from prompt
 */
export const SysDiagnosticCommand = meta.story({
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for content to appear (displaying state)
    await waitFor(() => expect(canvas.getByText('System Diagnostics')).toBeInTheDocument(), { timeout: 10000 });

    // Press Ctrl+C to dismiss content and show prompt
    dispatchCtrlC(canvasElement);

    // Wait for prompt cursor to appear
    await waitFor(() => expect(canvas.getByTestId('terminal-prompt-cursor')).toBeInTheDocument(), { timeout: 2000 });

    // Content should be hidden
    void expect(canvas.queryByText('System Diagnostics')).not.toBeInTheDocument();

    // Click to ensure keyboard listener is attached (webkit race condition fix)
    await userEvent.click(canvasElement);

    // Re-run sys.diagnostic (requires --user flag)
    await userEvent.keyboard('sys.diagnostic --user=eve0415{Enter}');

    // Content should reappear (back to displaying state)
    await waitFor(() => expect(canvas.getByText('System Diagnostics')).toBeInTheDocument(), { timeout: 2000 });

    // Prompt cursor should not be visible while displaying content
    void expect(canvas.queryByTestId('terminal-prompt-cursor')).not.toBeInTheDocument();
  },
});

/**
 * SysDiagnosticMissingFlag - Shows error for sys.diagnostic without --user flag
 */
export const SysDiagnosticMissingFlag = meta.story({
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for content to appear (displaying state)
    await waitFor(() => expect(canvas.getByText('System Diagnostics')).toBeInTheDocument(), { timeout: 10000 });

    // Press Ctrl+C to dismiss content and show prompt
    dispatchCtrlC(canvasElement);

    // Wait for prompt cursor to appear
    await waitFor(() => expect(canvas.getByTestId('terminal-prompt-cursor')).toBeInTheDocument(), { timeout: 2000 });

    // Click to ensure keyboard listener is attached (webkit race condition fix)
    await userEvent.click(canvasElement);

    // Try to run sys.diagnostic without --user flag
    await userEvent.keyboard('sys.diagnostic{Enter}');

    // Should show error message
    await waitFor(() => expect(canvas.getByTestId('terminal-output')).toHaveTextContent('missing required flag --user'));
  },
});

/**
 * ClearCommand - Shows clear command in action (also clears boot command line)
 */
export const ClearCommand = meta.story({
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for content to appear (displaying state)
    await waitFor(() => expect(canvas.getByText('System Diagnostics')).toBeInTheDocument(), { timeout: 10000 });

    // Press Ctrl+C to dismiss content and show prompt
    dispatchCtrlC(canvasElement);

    // Wait for prompt cursor to appear
    await waitFor(() => expect(canvas.getByTestId('terminal-prompt-cursor')).toBeInTheDocument(), { timeout: 2000 });

    // Header should exist before clear
    await expect(canvas.getByTestId('terminal-header')).toBeInTheDocument();

    // Click to ensure keyboard listener is attached (webkit race condition fix)
    await userEvent.click(canvasElement);

    // Add some output
    await userEvent.keyboard('help{Enter}');
    await waitFor(() => expect(canvas.getByTestId('terminal-output')).toBeInTheDocument());

    // Clear
    await userEvent.keyboard('clear{Enter}');

    // Output should be gone (element won't exist when lines.length === 0)
    await waitFor(() => expect(canvas.queryByTestId('terminal-output')).not.toBeInTheDocument());

    // Header (boot command line) should also be gone
    void expect(canvas.queryByTestId('terminal-header')).not.toBeInTheDocument();
  },
});
