// Type declarations for cloudflare:test module
// This module is provided by @cloudflare/vitest-pool-workers at runtime

declare module 'cloudflare:test' {
  /**
   * Environment bindings from wrangler.json, typed via worker-configuration.d.ts
   */
  export const env: Env;

  /**
   * Fetch handler for making requests to the worker
   */
  export const SELF: {
    fetch: typeof fetch;
    scheduled: (event: ScheduledEvent) => Promise<void>;
  };

  /**
   * Create a mock execution context
   */
  export function createExecutionContext(): ExecutionContext;
}
