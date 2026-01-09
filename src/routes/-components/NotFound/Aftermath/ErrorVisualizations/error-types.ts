export type ErrorType = 'null-pointer' | 'stack-overflow' | 'file-not-found' | 'seg-fault' | 'out-of-memory' | 'index-out-of-bounds';

export interface ErrorVisualization {
  type: ErrorType;
  title: string;
  subtitle: string;
  language: string;
  fixAction: string; // Button text for navigation
}

export const ERROR_VISUALIZATIONS: ErrorVisualization[] = [
  {
    type: 'null-pointer',
    title: 'NullPointerException',
    subtitle: 'java.lang.NullPointerException: Cannot invoke method on null reference',
    language: 'Java',
    fixAction: 'ポインタを初期化',
  },
  {
    type: 'stack-overflow',
    title: 'StackOverflowError',
    subtitle: 'Maximum call stack size exceeded',
    language: 'JavaScript',
    fixAction: 'スタックをクリア',
  },
  {
    type: 'file-not-found',
    title: '404 Not Found',
    subtitle: "ENOENT: no such file or directory, open '/page'",
    language: 'Node.js',
    fixAction: 'ファイルを作成',
  },
  {
    type: 'seg-fault',
    title: 'Segmentation Fault',
    subtitle: 'Segmentation fault (core dumped) at address 0x00000000',
    language: 'C/C++',
    fixAction: 'メモリを修復',
  },
  {
    type: 'out-of-memory',
    title: 'OutOfMemoryError',
    subtitle: 'FATAL ERROR: CALL_AND_RETRY_LAST Allocation failed - heap out of memory',
    language: 'Node.js',
    fixAction: 'メモリを解放',
  },
  {
    type: 'index-out-of-bounds',
    title: 'IndexOutOfBoundsException',
    subtitle: 'Array index 404 out of bounds for length 200',
    language: 'Java',
    fixAction: '境界を修正',
  },
];

// Get random error type (seeded by current minute for variety but consistency within page load)
export const getRandomError = (): ErrorVisualization => {
  // Use a simple hash of the current second to pick an error
  // This gives variety on each visit but consistency during the visit
  const seed = Math.floor(Date.now() / 1000) % ERROR_VISUALIZATIONS.length;
  return ERROR_VISUALIZATIONS[seed]!;
};
