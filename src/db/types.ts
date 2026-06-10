import type * as schema from './schema';
// Inferred types from Drizzle schema - single source of truth
import type { InferSelectModel } from 'drizzle-orm';

export type Repo = InferSelectModel<typeof schema.repos>;
