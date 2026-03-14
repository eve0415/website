// Stub for cloudflare:test in node environment
// @cloudflare/vitest-pool-workers is incompatible with vite-plus-test

export const createExecutionContext = () => {
  const promises: Promise<unknown>[] = [];
  return {
    waitUntil: (promise: Promise<unknown>) => {
      promises.push(promise);
    },
    passThroughOnException: () => {},
    _promises: promises,
  };
};

export const createScheduledController = (options?: { scheduledTime?: number; cron?: string }) => ({
  scheduledTime: options?.scheduledTime ?? Date.now(),
  cron: options?.cron ?? '',
  noRetry: () => {},
});

export const waitOnExecutionContext = async (ctx: ReturnType<typeof createExecutionContext>) => {
  await Promise.all(ctx._promises);
};
