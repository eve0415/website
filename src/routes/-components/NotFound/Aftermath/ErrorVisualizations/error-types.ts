export const ERROR_TYPES = [
  'null-pointer',
  'stack-overflow',
  'file-not-found',
  'seg-fault',
  'out-of-memory',
  'index-out-of-bounds',
  'type-error',
  'syntax-error',
  'recursion-error',
  'division-by-zero',
  'class-not-found',
  'panic',
  'timeout-error',
  'concurrent-modification',
  'buffer-overflow',
  'assertion-error',
  'undefined-behavior',
  'type-mismatch',
] as const;

export type ErrorType = (typeof ERROR_TYPES)[number];

// Get random error type (seeded by current second for variety but consistency within page load)
export const getRandomErrorType = (): ErrorType => {
  const [fallback] = ERROR_TYPES;
  // Use a simple hash of the current second to pick an error
  // This gives variety on each visit but consistency during the visit
  const seed = Math.floor(Date.now() / 1000) % ERROR_TYPES.length;
  return ERROR_TYPES[seed] ?? fallback;
};
