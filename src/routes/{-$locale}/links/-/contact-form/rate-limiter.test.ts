import type { ContactRateLimiter } from './rate-limiter';

import { evictDurableObject, runDurableObjectAlarm, runInDurableObject } from 'cloudflare:test';
import { env } from 'cloudflare:workers';
import { afterEach, describe, expect, it, vi } from 'vitest';

/**
 * Storage is isolated per test file rather than per test, so every test below
 * reaches for its own object name. Sharing one would make the suite pass in
 * declaration order and fail under `sequence.shuffle`.
 */
const limiterFor = (name: string) => env.CONTACT_RATE_LIMIT.getByName(name);

/**
 * One reservation at a time, for the tests whose subject is the count rather than
 * the concurrency. Atomicity has its own test, which reserves concurrently.
 */
const reserveOneByOne = async (limiter: ContactRateLimiter, times: number): Promise<boolean[]> => {
  const outcomes: boolean[] = [];
  for (let attempt = 0; attempt < times; attempt += 1) outcomes.push(await limiter.reserve());
  return outcomes;
};

/** DELIVER_MAX and RELEASE_MAX, which the module keeps to itself. */
const DELIVERIES = 3;
const RELEASES = 9;

/**
 * Far enough ahead of the real clock that `setAlarm(now + WINDOW_MS)` is still in
 * miniflare's future. Pinned to a past instant instead, the scheduler fires the
 * alarm on its own and `runDurableObjectAlarm` finds nothing left to run.
 */
const WINDOW_START = new Date('2030-01-01T00:00:00Z');

const MINUTE_MS = 60_000;

/** Minutes after `WINDOW_START`, which is where every fake-clock test begins. */
const at = (minutes: number) => new Date(WINDOW_START.getTime() + minutes * MINUTE_MS);

const AFTER_WINDOW = at(61);

afterEach(() => {
  vi.useRealTimers();
});

describe('reserve', () => {
  it('hands out one window of deliveries and then refuses', async () => {
    const outcome = await runInDurableObject(limiterFor('reserve-cap'), async limiter => reserveOneByOne(limiter, DELIVERIES + 1));

    expect(outcome).toStrictEqual([true, true, true, false]);
  });

  it('counts reservations that arrive together against one budget, not each against the same count', async () => {
    // Concurrent on purpose. `reserve` reads the count, decides on it and writes
    // it back with no `await` in between, so four calls landing together still
    // increment one at a time. Slip a single `await` between the check and the
    // assignment and all four read a used count of zero and all four are granted.
    const outcome = await runInDurableObject(limiterFor('reserve-atomic'), async limiter =>
      Promise.all(Array.from({ length: DELIVERIES + 1 }, async () => limiter.reserve())),
    );

    const granted = outcome.filter(Boolean).length;

    expect({ granted, refused: outcome.length - granted }).toStrictEqual({ granted: DELIVERIES, refused: 1 });
  });

  it('reads the count back from storage after the instance is torn down', async () => {
    const stub = limiterFor('survives-eviction');
    await runInDurableObject(stub, async limiter => reserveOneByOne(limiter, DELIVERIES));

    await evictDurableObject(stub);

    expect(await runInDurableObject(stub, async limiter => limiter.reserve())).toBe(false);
  });

  it('runs the window from the last accepted reservation rather than the first', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(WINDOW_START);
    const stub = limiterFor('rolling-window');

    await runInDurableObject(stub, async limiter => reserveOneByOne(limiter, DELIVERIES - 1));

    vi.setSystemTime(at(59));
    const last = await runInDurableObject(stub, async limiter => limiter.reserve());

    // Past an hour from the first reservation, but not from the third — so the
    // budget is still spent. A window pinned to the first would be open here.
    vi.setSystemTime(at(61));
    const afterFirstHour = await runInDurableObject(stub, async limiter => limiter.reserve());

    expect([last, afterFirstHour]).toStrictEqual([true, false]);
  });

  it('starts a fresh window once the old one has expired', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(WINDOW_START);
    const stub = limiterFor('window-expiry');

    const spent = await runInDurableObject(stub, async limiter => reserveOneByOne(limiter, DELIVERIES + 1));

    vi.setSystemTime(AFTER_WINDOW);
    const reopened = await runInDurableObject(stub, async limiter => limiter.reserve());

    expect([spent.at(-1), reopened]).toStrictEqual([false, true]);
  });
});

describe('release', () => {
  it('hands a slot back so a failed delivery costs the sender nothing', async () => {
    const outcome = await runInDurableObject(limiterFor('release-restores'), async limiter => {
      await reserveOneByOne(limiter, DELIVERIES);
      await limiter.release();
      return limiter.reserve();
    });

    expect(outcome).toBe(true);
  });

  it('stops handing slots back once the window has spent its release budget', async () => {
    const outcome = await runInDurableObject(limiterFor('release-cap'), async limiter => {
      // Spends the whole release budget while leaving the delivery count at zero,
      // which is the shape a free-send loop would have.
      for (let cycle = 0; cycle < RELEASES; cycle += 1) {
        await limiter.reserve();
        await limiter.release();
      }

      const reserved = await limiter.reserve();
      await limiter.release();
      return [reserved, ...(await reserveOneByOne(limiter, DELIVERIES))];
    });

    expect(outcome).toStrictEqual([true, true, true, false]);
  });

  it('keeps a spent release budget across an eviction, so evicting cannot buy more attempts', async () => {
    const stub = limiterFor('release-cap-survives-eviction');
    await runInDurableObject(stub, async limiter => {
      for (let cycle = 0; cycle < RELEASES; cycle += 1) {
        await limiter.reserve();
        await limiter.release();
      }
    });

    await evictDurableObject(stub);

    const outcome = await runInDurableObject(stub, async limiter => {
      const reserved = await limiter.reserve();
      await limiter.release();
      return [reserved, ...(await reserveOneByOne(limiter, DELIVERIES))];
    });

    expect(outcome).toStrictEqual([true, true, true, false]);
  });

  it('does nothing when the caller holds no slot', async () => {
    const outcome = await runInDurableObject(limiterFor('release-idle'), async limiter => {
      await limiter.reserve();
      await limiter.release();
      await limiter.release();
      return reserveOneByOne(limiter, DELIVERIES + 1);
    });

    expect(outcome).toStrictEqual([true, true, true, false]);
  });

  it('persists nothing when a release arrives after its window has closed', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(WINDOW_START);
    const stub = limiterFor('release-after-window');
    await runInDurableObject(stub, async limiter => reserveOneByOne(limiter, DELIVERIES));

    const before = await runInDurableObject(stub, async (_limiter, state) => state.storage.list());

    vi.setSystemTime(AFTER_WINDOW);
    await runInDurableObject(stub, async limiter => limiter.release());

    // Without the expiry guard this decrements the stale count and writes it
    // back, which is observable here even though the next reserve() would
    // have discarded the window anyway.
    const after = await runInDurableObject(stub, async (_limiter, state) => state.storage.list());

    expect([...after]).toStrictEqual([...before]);
  });

  it('persists nothing on an object that has never reserved anything', async () => {
    const stub = limiterFor('release-fresh');
    await runInDurableObject(stub, async limiter => limiter.release());

    // The write is the observable part. Asserting the budget is still whole
    // instead would hold just as well with both of release()'s guards deleted,
    // because the next reserve() discards an expired window either way.
    const rows = await runInDurableObject(stub, async (_limiter, state) => state.storage.list());

    expect(rows.size).toBe(0);
  });
});

describe('alarm', () => {
  it('leaves a live window alone', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(WINDOW_START);
    const stub = limiterFor('alarm-live-window');
    await runInDurableObject(stub, async limiter => limiter.reserve());

    const ran = await runDurableObjectAlarm(stub);
    const rows = await runInDurableObject(stub, async (_limiter, state) => state.storage.list());

    expect([ran, rows.size]).toStrictEqual([true, 1]);
  });

  it('drops the rows a spent window is still holding', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(WINDOW_START);
    const stub = limiterFor('alarm-spent-window');
    await runInDurableObject(stub, async limiter => limiter.reserve());

    vi.setSystemTime(AFTER_WINDOW);
    const ran = await runDurableObjectAlarm(stub);
    const rows = await runInDurableObject(stub, async (_limiter, state) => state.storage.list());

    expect([ran, rows.size]).toStrictEqual([true, 0]);
  });
});
