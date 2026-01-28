/* oxlint-disable typescript-eslint(no-unsafe-assignment), typescript-eslint(no-unsafe-call), typescript-eslint(no-unsafe-member-access) -- Test file uses vi.spyOn which returns any */
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { printConsoleArt, printSecretMessage } from './console-art';

describe('printConsoleArt', () => {
  let consoleSpy: {
    clear: ReturnType<typeof vi.spyOn>;
    log: ReturnType<typeof vi.spyOn>;
  };

  beforeEach(() => {
    consoleSpy = {
      clear: vi.spyOn(console, 'clear').mockImplementation(() => {}),
      log: vi.spyOn(console, 'log').mockImplementation(() => {}),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // @ts-expect-error Cleanup globalThis.window
    delete globalThis.window;
  });

  test('does nothing on server (no window)', () => {
    // Ensure window is undefined
    // @ts-expect-error Testing server environment
    delete globalThis.window;

    printConsoleArt();

    expect(consoleSpy.clear).not.toHaveBeenCalled();
    expect(consoleSpy.log).not.toHaveBeenCalled();
  });

  test('calls console.clear in browser', () => {
    // @ts-expect-error Mock window
    globalThis.window = {};

    printConsoleArt();

    expect(consoleSpy.clear).toHaveBeenCalledOnce();
  });

  test('logs ASCII logo with correct styling', () => {
    // @ts-expect-error Mock window
    globalThis.window = {};

    printConsoleArt();

    // Find the log call with the ASCII art
    const logoCall = consoleSpy.log.mock.calls.find((call: string[]) => String(call[0]).includes('███████╗'));

    expect(logoCall).toBeDefined();
    expect(logoCall?.[0]).toContain('███████╗');
    expect(logoCall?.[1]).toBe('color: #00ff88; font-weight: bold;');
  });

  test('logs all messages', () => {
    // @ts-expect-error Mock window
    globalThis.window = {};

    printConsoleArt();

    // Check for specific messages
    expect(consoleSpy.log).toHaveBeenCalledWith('%cようこそ、開発者さん。', 'color: #a3a3a3; font-size: 12px;');
    expect(consoleSpy.log).toHaveBeenCalledWith('%cソースコードを覗いてる？いいね。', 'color: #a3a3a3; font-size: 12px;');
    expect(consoleSpy.log).toHaveBeenCalledWith('%cこのサイト自体がポートフォリオです。', 'color: #a3a3a3; font-size: 12px;');
  });

  test('highlights GitHub and Twitter lines with special styling', () => {
    // @ts-expect-error Mock window
    globalThis.window = {};

    printConsoleArt();

    expect(consoleSpy.log).toHaveBeenCalledWith('%cGitHub: github.com/eve0415', 'color: #00d4ff; font-weight: bold;');
    expect(consoleSpy.log).toHaveBeenCalledWith('%cTwitter: @eveevekun', 'color: #00d4ff; font-weight: bold;');
  });

  test('logs konami code hint with secret styling', () => {
    // @ts-expect-error Mock window
    globalThis.window = {};

    printConsoleArt();

    expect(consoleSpy.log).toHaveBeenCalledWith('%c💡 Hint: Konami Code を知ってる？', 'color: #ff6b35; font-style: italic;');
  });

  test('logs empty lines for spacing', () => {
    // @ts-expect-error Mock window
    globalThis.window = {};

    printConsoleArt();

    // Count empty string calls for spacing
    const emptyLineCalls = consoleSpy.log.mock.calls.filter((call: string[]) => call[0] === '');
    expect(emptyLineCalls.length).toBeGreaterThan(0);
  });
});

describe('printSecretMessage', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('logs message with emoji prefix and highlight styling', () => {
    printSecretMessage('You found the secret!');

    expect(consoleSpy).toHaveBeenCalledOnce();
    expect(consoleSpy).toHaveBeenCalledWith('%c🎉 You found the secret!', 'color: #00d4ff; font-weight: bold;');
  });

  test('handles empty message', () => {
    printSecretMessage('');

    expect(consoleSpy).toHaveBeenCalledWith('%c🎉 ', 'color: #00d4ff; font-weight: bold;');
  });

  test('handles Japanese message', () => {
    printSecretMessage('コナミコマンド発動！');

    expect(consoleSpy).toHaveBeenCalledWith('%c🎉 コナミコマンド発動！', 'color: #00d4ff; font-weight: bold;');
  });
});
