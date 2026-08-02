import { vi } from 'vitest';

/**
 * MediaQueryList with a writable `matches`, so a test can flip it before firing
 * the change listener it captured.
 */
export type MediaQueryListMock = Omit<MediaQueryList, 'matches'> & { matches: boolean };

/**
 * Creates a properly typed MediaQueryList mock with all required properties.
 * Use this factory in tests that mock window.matchMedia to ensure type safety.
 */
export const createMediaQueryListMock = (matches = false, media = ''): MediaQueryListMock => {
  const mock: MediaQueryListMock = {
    matches,
    media,
    onchange: null,
    // MediaQueryList still requires the pre-2019 listener pair, deprecated or not.
    // oxlint-disable-next-line typescript/no-deprecated -- required members of the DOM interface we are mocking
    addListener: vi.fn<(callback: (this: MediaQueryList, ev: MediaQueryListEvent) => unknown) => void>(),
    // oxlint-disable-next-line typescript/no-deprecated -- required members of the DOM interface we are mocking
    removeListener: vi.fn<(callback: (this: MediaQueryList, ev: MediaQueryListEvent) => unknown) => void>(),
    addEventListener: vi.fn<typeof EventTarget.prototype.addEventListener>(),
    removeEventListener: vi.fn<typeof EventTarget.prototype.removeEventListener>(),
    dispatchEvent: vi.fn<typeof EventTarget.prototype.dispatchEvent>().mockReturnValue(true),
  };
  return mock;
};

/**
 * Creates a matchMedia mock implementation that returns a properly typed MediaQueryList.
 */
export const createMatchMediaMock = (matches = false) =>
  vi.fn<typeof globalThis.matchMedia>().mockImplementation((query: string) => createMediaQueryListMock(matches, query));
