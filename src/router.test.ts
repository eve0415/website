import { describe, expect, test } from 'vitest';

import { getRouter } from './router';

describe('router', () => {
  test('getRouter returns a valid router instance', () => {
    const router = getRouter();

    expect(router).toBeDefined();
    expect(router.routeTree).toBeDefined();
    expect(router.options.scrollRestoration).toBe(true);
  });
});
