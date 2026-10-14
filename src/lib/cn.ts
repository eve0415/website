import { createCn } from 'cn/engine';

import tables from './cn-tables.gen';

/**
 * Merge Tailwind class lists so the last conflicting utility wins.
 * Lets a component ship a default class list that a caller can override
 * without fighting source order.
 */
export const cn = createCn(tables);
