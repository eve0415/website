import type { ClassValue } from 'clsx';

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind class lists so the last conflicting utility wins.
 * Lets a component ship a default class list that a caller can override
 * without fighting source order.
 */
export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));
