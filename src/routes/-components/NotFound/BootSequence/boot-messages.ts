export interface BootMessage {
  text: string;
  type: 'info' | 'success' | 'warning' | 'error';
  delay: number; // ms from sequence start
}

// Browser Critical Rendering Path sequence - accurate SSR loading flow
// Mixed language: English protocol names + Japanese status labels
export const BOOT_MESSAGES: BootMessage[] = [
  // Network phase
  { text: 'Navigation 開始: eve0415.net', type: 'info', delay: 0 },
  { text: 'DNS 解決中... eve0415.net → 104.21.48.170', type: 'info', delay: 200 },
  { text: 'TCP SYN → SYN-ACK → ACK: port 443', type: 'success', delay: 500 },
  { text: 'TLS 1.3 ClientHello → ServerHello', type: 'info', delay: 900 },
  { text: "証明書検証: CN=eve0415.net (Let's Encrypt) ✓", type: 'success', delay: 1300 },

  // HTTP phase
  { text: 'GET /[path] HTTP/2 送信', type: 'info', delay: 1600 },
  { text: 'HTTP/2 404 Not Found', type: 'warning', delay: 1900 },
  { text: 'Content-Encoding: br, Transfer: 12.4 KB', type: 'info', delay: 2200 },

  // Parse phase
  { text: 'HTML パース開始... <!DOCTYPE html>', type: 'info', delay: 2600 },
  { text: '<head> 解析中... CSS/JS 発見', type: 'info', delay: 2900 },
  { text: '<link rel="dns-prefetch">, <link rel="preconnect">', type: 'info', delay: 3200 },

  // Resource loading phase
  { text: 'CSS 取得中: __root.css (56 KB, render-blocking)', type: 'info', delay: 3500 },
  { text: '<link rel="preload" as="script">', type: 'info', delay: 3800 },
  { text: 'CSSOM 構築中...', type: 'info', delay: 4100 },

  // Render phase
  { text: 'DOM 構築完了: 47 nodes', type: 'success', delay: 4400 },
  { text: 'Render Tree 生成: DOM + CSSOM', type: 'info', delay: 4700 },
  { text: 'Layout 計算中... (reflow)', type: 'info', delay: 5000 },
  { text: 'Paint 処理... (rasterize)', type: 'info', delay: 5300 },
  { text: 'FCP: SSR コンテンツ表示', type: 'success', delay: 5500 },

  // JS execution phase
  { text: 'JavaScript 取得完了: 468 KB', type: 'info', delay: 5800 },
  { text: 'JavaScript 実行開始...', type: 'info', delay: 6100 },
  { text: 'React Hydration: hydrateRoot()', type: 'info', delay: 6400 },

  // Error phase
  { text: '[ERROR] Hydration 失敗: RouteNotFound', type: 'error', delay: 6600 },
  { text: '[CRITICAL] React: Unrecoverable Error', type: 'error', delay: 6800 },
];

// Progress bar stages - browser loading phases
export interface ProgressStage {
  label: string;
  duration: number; // ms
  startAt: number; // ms from sequence start
}

export const PROGRESS_STAGES: ProgressStage[] = [
  { label: 'Network', duration: 1300, startAt: 0 },
  { label: 'HTTP', duration: 900, startAt: 1300 },
  { label: 'Parse', duration: 1300, startAt: 2200 },
  { label: 'Resources', duration: 900, startAt: 3500 },
  { label: 'Render', duration: 1400, startAt: 4400 },
  { label: 'Hydrate', duration: 1000, startAt: 5800 },
];

// Get the total duration of boot sequence
export const BOOT_DURATION = BOOT_MESSAGES.at(-1)!.delay + 200; // Last message + buffer
