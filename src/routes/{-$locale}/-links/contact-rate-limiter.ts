import { DurableObject } from 'cloudflare:workers';

/**
 * The contact form's per-sender budget, serialized.
 *
 * A Durable Object rather than KV because the counter is a read-modify-write and
 * KV cannot make one atomic: two submissions arriving together each read the same
 * count before either write lands, so both proceed and the cap never engages. One
 * object per bucket — the output of `rateLimitKey`, so an IPv6 host is one /64 and
 * not one address — gives every sender their own single-threaded counter.
 *
 * Cloudflare's native Rate Limiting binding cannot stand in here: its `simple.period`
 * accepts only 10 or 60 seconds, so an hourly budget is not expressible.
 */

/** Three sends an hour per address is generous for a personal contact form. */
const DELIVER_MAX = 3;

/**
 * How many reserved slots one window may hand back.
 *
 * A slot is taken before the mail is attempted and returned when the attempt
 * fails, so a transient outage costs the sender nothing. Unbounded, that is a
 * free-send loop: anyone who can force the failure path reserves and releases
 * forever. Nine is three full budgets' worth of retries — a visitor who has to
 * try every one of their three sends four times still gets all three through —
 * and it caps the loop at DELIVER_MAX + RELEASE_MAX submissions in a window.
 */
const RELEASE_MAX = 9;

const WINDOW_MS = 3_600_000;

const STATE_KEY = 'budget';

interface Budget {
  /** Slots taken and not returned; what the cap is checked against. */
  used: number;
  /** Slots handed back so far, so releasing cannot be repeated without end. */
  released: number;
  /**
   * Refreshed by every accepted reservation, so the window is "an hour since the
   * last accepted send" rather than a fixed hour — stricter, and never looser. A
   * refused reservation deliberately does not extend it, or a flood would hold
   * its own block open.
   */
  expiresAt: number;
}

const EMPTY: Budget = { used: 0, released: 0, expiresAt: 0 };

/**
 * Storage hands back `unknown`, so the stored shape is checked rather than
 * asserted — a value written by an older shape of this class reads as absent and
 * the window simply starts over.
 */
const isBudget = (value: unknown): value is Budget =>
  typeof value === 'object' &&
  value !== null &&
  'used' in value &&
  typeof value.used === 'number' &&
  'released' in value &&
  typeof value.released === 'number' &&
  'expiresAt' in value &&
  typeof value.expiresAt === 'number';

export class ContactRateLimiter extends DurableObject {
  /**
   * The budget lives in memory so that reading it, deciding on it and writing it
   * back is straight-line code with no `await` in the middle. Awaiting a storage
   * read inside `reserve` would reintroduce exactly the interleaving this class
   * exists to remove: a Durable Object is single-threaded, but an `await` inside
   * one of its methods is still a yield point another invocation can land on.
   */
  #budget: Budget = EMPTY;

  readonly #loaded: Promise<void>;

  constructor(ctx: DurableObjectState, env: Cloudflare.Env) {
    super(ctx, env);

    // Kept rather than dropped so nothing floats: `blockConcurrencyWhile` already
    // holds every incoming call until the load finishes, so the awaits below are
    // on an already-settled promise and only make that ordering explicit.
    this.#loaded = ctx.blockConcurrencyWhile(async () => {
      const stored = await ctx.storage.get(STATE_KEY);
      if (isBudget(stored)) this.#budget = stored;
    });
  }

  /**
   * Takes a slot if the window has one left. `true` means the caller owns it and
   * must `release()` it if the send fails.
   */
  async reserve(): Promise<boolean> {
    await this.#loaded;

    const now = Date.now();

    // From here to the assignment there is no `await`, so no second invocation
    // can read this count between the check and the increment.
    const current = this.#budget.expiresAt > now ? this.#budget : EMPTY;
    if (current.used >= DELIVER_MAX) return false;

    this.#budget = { used: current.used + 1, released: current.released, expiresAt: now + WINDOW_MS };

    await this.#persist();
    return true;
  }

  /** Hands a slot back after a failed delivery, while the release budget lasts. */
  async release(): Promise<void> {
    await this.#loaded;

    const current = this.#budget;
    if (current.expiresAt <= Date.now() || current.used === 0 || current.released >= RELEASE_MAX) return;

    this.#budget = { used: current.used - 1, released: current.released + 1, expiresAt: current.expiresAt };

    await this.#persist();
  }

  /**
   * Housekeeping only — `expiresAt` is what makes the window correct, and it is
   * checked on every read. This just stops a spent object holding rows forever.
   */
  override async alarm(): Promise<void> {
    await this.#loaded;

    if (this.#budget.expiresAt > Date.now()) return;

    this.#budget = EMPTY;
    await this.ctx.storage.deleteAll();
  }

  async #persist(): Promise<void> {
    await this.ctx.storage.put(STATE_KEY, this.#budget);
    await this.ctx.storage.setAlarm(this.#budget.expiresAt);
  }
}
