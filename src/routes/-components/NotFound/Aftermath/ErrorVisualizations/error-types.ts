/* oxlint-disable typescript-eslint(no-non-null-assertion) -- Array indexing with bounds check */
export type ErrorType =
  | 'null-pointer'
  | 'stack-overflow'
  | 'file-not-found'
  | 'seg-fault'
  | 'out-of-memory'
  | 'index-out-of-bounds'
  | 'type-error'
  | 'syntax-error'
  | 'recursion-error'
  | 'division-by-zero'
  | 'class-not-found'
  | 'panic'
  | 'timeout-error'
  | 'concurrent-modification'
  | 'buffer-overflow'
  | 'assertion-error'
  | 'undefined-behavior'
  | 'type-mismatch';

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
  {
    type: 'type-error',
    title: 'TypeError',
    subtitle: "Cannot read properties of undefined (reading 'page')",
    language: 'JavaScript',
    fixAction: '型を検証',
  },
  {
    type: 'syntax-error',
    title: 'SyntaxError',
    subtitle: "Unexpected token '<'",
    language: 'JavaScript',
    fixAction: '構文を修正',
  },
  {
    type: 'recursion-error',
    title: 'RecursionError',
    subtitle: 'maximum recursion depth exceeded',
    language: 'Python',
    fixAction: '再帰を終了',
  },
  {
    type: 'division-by-zero',
    title: 'ZeroDivisionError',
    subtitle: 'division by zero',
    language: 'Python',
    fixAction: 'ゼロを回避',
  },
  {
    type: 'class-not-found',
    title: 'ClassNotFoundException',
    subtitle: 'java.lang.ClassNotFoundException: Page',
    language: 'Java',
    fixAction: 'クラスを探す',
  },
  {
    type: 'panic',
    title: 'panic',
    subtitle: 'runtime error: invalid memory address or nil pointer dereference',
    language: 'Go',
    fixAction: 'recover()',
  },
  {
    type: 'timeout-error',
    title: 'context deadline exceeded',
    subtitle: 'context.DeadlineExceeded',
    language: 'Go',
    fixAction: 'タイムアウト延長',
  },
  {
    type: 'concurrent-modification',
    title: 'ConcurrentModificationException',
    subtitle: 'java.util.ConcurrentModificationException',
    language: 'Java',
    fixAction: '同期を取る',
  },
  {
    type: 'buffer-overflow',
    title: 'buffer overflow detected',
    subtitle: '*** stack smashing detected ***: terminated',
    language: 'C',
    fixAction: '境界チェック',
  },
  {
    type: 'assertion-error',
    title: 'AssertionError',
    subtitle: 'expected 200, got 404',
    language: 'Python',
    fixAction: 'テストを修正',
  },
  {
    type: 'undefined-behavior',
    title: 'undefined behavior',
    subtitle: 'reading uninitialized memory',
    language: 'C/C++',
    fixAction: '未定義を回避',
  },
  {
    type: 'type-mismatch',
    title: 'Type Mismatch',
    subtitle: "Type 'string' is not assignable to type 'number'",
    language: 'TypeScript',
    fixAction: '型を合わせる',
  },
];

// Get random error type (seeded by current second for variety but consistency within page load)
export const getRandomError = (): ErrorVisualization => {
  // Use a simple hash of the current second to pick an error
  // This gives variety on each visit but consistency during the visit
  const seed = Math.floor(Date.now() / 1000) % ERROR_VISUALIZATIONS.length;
  return ERROR_VISUALIZATIONS[seed]!;
};
