import { vi } from 'vitest';

export const fakeTimers = (opts?: Parameters<typeof vi.useFakeTimers>[0]): Disposable => {
  vi.useFakeTimers(opts);
  return {
    [Symbol.dispose]: () => {
      vi.useRealTimers();
    },
  };
};

export const forceReducedMotion = (value: boolean | undefined): Disposable => {
  const prev = globalThis.__FORCE_REDUCED_MOTION__;
  globalThis.__FORCE_REDUCED_MOTION__ = value;
  return {
    [Symbol.dispose]: () => {
      globalThis.__FORCE_REDUCED_MOTION__ = prev;
    },
  };
};
