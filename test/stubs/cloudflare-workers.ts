/* oxlint-disable typescript-eslint(require-await), typescript-eslint(no-unsafe-type-assertion) -- Stub implementations match Cloudflare's async API surface */
// Stub for cloudflare:workers in non-cloudflare test environments
// Provides in-memory KV and minimal D1 implementations

// In-memory KV store
class InMemoryKVNamespace {
  private store = new Map<string, { value: string; expiration: number | undefined }>();

  async get<T = string>(key: string, options?: 'text' | 'json' | 'arrayBuffer' | 'stream' | { type?: string }): Promise<T | null> {
    const entry = this.store.get(key);
    if (entry === undefined) return null;
    if (entry.expiration !== undefined && Date.now() / 1000 > entry.expiration) {
      this.store.delete(key);
      return null;
    }
    const type = typeof options === 'string' ? options : (options?.type ?? 'text');
    if (type === 'json') return JSON.parse(entry.value) as T;
    return entry.value as unknown as T;
  }

  async put(key: string, value: string, options?: { expirationTtl?: number; expiration?: number }): Promise<void> {
    const ttl = options?.expirationTtl;
    const expiration = options?.expiration ?? (ttl !== undefined && ttl !== 0 ? Math.floor(Date.now() / 1000) + ttl : undefined);
    this.store.set(key, { value, expiration });
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  async list(options?: { prefix?: string; limit?: number; cursor?: string }): Promise<{ keys: { name: string }[]; list_complete: boolean; cursor?: string }> {
    const keys = [...this.store.keys()].filter(k => options?.prefix === undefined || k.startsWith(options.prefix)).map(name => ({ name }));
    return { keys, list_complete: true };
  }
}

// Minimal D1 statement stub
class D1PreparedStatement {
  private _sql: string;
  constructor(sql: string, _params: unknown[] = []) {
    this._sql = sql;
  }
  bind(...params: unknown[]): D1PreparedStatement {
    return new D1PreparedStatement(this._sql, params);
  }
  async run(): Promise<{ success: boolean; results: unknown[]; meta: Record<string, unknown> }> {
    return { success: true, results: [], meta: {} };
  }
  async all<T = Record<string, unknown>>(): Promise<{ success: boolean; results: T[]; meta: Record<string, unknown> }> {
    return { success: true, results: [] as T[], meta: {} };
  }
  async first<T = Record<string, unknown>>(_col?: string): Promise<T | null> {
    return null;
  }
  async raw<T = unknown[]>(): Promise<T[]> {
    return [] as T[];
  }
}

// Minimal D1 database stub
class InMemoryD1Database {
  prepare(sql: string): D1PreparedStatement {
    return new D1PreparedStatement(sql);
  }
  async batch(statements: D1PreparedStatement[]): Promise<{ success: boolean; results: unknown[]; meta: Record<string, unknown> }[]> {
    return statements.map(() => ({ success: true, results: [], meta: {} }));
  }
  async dump(): Promise<ArrayBuffer> {
    return new ArrayBuffer(0);
  }
}

// Create env with typed bindings matching wrangler.json
export const env = {
  CACHE: new InMemoryKVNamespace(),
  CONTACT_RATE_LIMIT: new InMemoryKVNamespace(),
  SKILLS_DB: new InMemoryD1Database(),
  CONTACT_EMAIL: { send: async () => {} },
  AI: {},
  SKILLS_WORKFLOW: {},
  GITHUB_PAT: 'test-pat',
  MAIL_ADDRESS: 'test@example.com',
} as Record<string, unknown>;

// Stub base classes for Cloudflare Workers
export class WorkflowEntrypoint<TEnv = unknown> {
  protected env!: TEnv;
  protected ctx!: ExecutionContext;
}

export class DurableObject<TEnv = unknown> {
  protected env!: TEnv;
  protected ctx!: DurableObjectState;
}

// withEnv: temporarily override env bindings within a callback
export const withEnv = async <T>(overrides: Record<string, unknown>, fn: () => T | Promise<T>): Promise<T> => {
  const original: Record<string, unknown> = {};
  for (const key of Object.keys(overrides)) {
    original[key] = env[key];
    env[key] = overrides[key];
  }
  try {
    return await fn();
  } finally {
    for (const key of Object.keys(original)) {
      env[key] = original[key];
    }
  }
};
