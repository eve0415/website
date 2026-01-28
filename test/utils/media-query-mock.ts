import { vi } from 'vitest';

/**
 * Creates a properly typed MediaQueryList mock with all required properties.
 * Use this factory in tests that mock window.matchMedia to ensure type safety.
 */
export const createMediaQueryListMock = (matches = false, media = ''): MediaQueryList => {
  const mock: MediaQueryList = {
    matches,
    media,
    onchange: null,
    addListener: vi.fn<(callback: (this: MediaQueryList, ev: MediaQueryListEvent) => unknown) => void>(),
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
