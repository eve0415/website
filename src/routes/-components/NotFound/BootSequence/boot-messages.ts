import type { ConnectionInfo } from './connection-info';
import type { DOMScanData } from './useDOMScan';
import type { NavigationTimingData } from './useNavigationTiming';

export type MessageType = 'info' | 'success' | 'warning' | 'error' | 'group';

export interface BootMessage {
  id: string;
  text: string | ((ctx: BootContext) => string);
  type: MessageType;
  // Nested messages for Step Into
  children?: BootMessage[];
  // Base delay from sequence start (before adaptive scaling)
  baseDelay: number;
}

export interface BootContext {
  timing: NavigationTimingData;
  dom: DOMScanData;
  connection: ConnectionInfo;
  path: string;
}

export interface ProgressStage {
  label: string;
  duration: number; // ms
  startAt: number; // ms from sequence start
}

// Flatten messages for sequential display, respecting hierarchy
export const flattenMessages = (messages: BootMessage[], depth: number = 0): Array<BootMessage & { depth: number }> => {
  const result: Array<BootMessage & { depth: number }> = [];

  for (const msg of messages) {
    result.push({ ...msg, depth });
    if (msg.children) {
      result.push(...flattenMessages(msg.children, depth + 1));
    }
  }

  return result;
};

// Get text from message, resolving dynamic text functions
export const resolveMessageText = (msg: BootMessage, ctx: BootContext): string => {
  return typeof msg.text === 'function' ? msg.text(ctx) : msg.text;
};

/**
 * Hierarchical boot messages with real data interpolation.
 * Each group can be "stepped into" in debug mode.
 */
export const createBootMessages = (): BootMessage[] => [
  // Navigation group
  {
    id: 'nav',
    text: 'Navigation',
    type: 'group',
    baseDelay: 0,
    children: [
      {
        id: 'nav-start',
        text: 'Navigation 開始: eve0415.net',
        type: 'info',
        baseDelay: 0,
      },
      {
        id: 'nav-dns',
        text: ctx => `DNS 解決中... eve0415.net → ${ctx.connection.serverIp} (${ctx.timing.dns}ms)`,
        type: 'info',
        baseDelay: 200,
      },
    ],
  },

  // TCP/TLS Handshake group (detailed)
  {
    id: 'tls',
    text: 'TLS Handshake',
    type: 'group',
    baseDelay: 400,
    children: [
      {
        id: 'tcp-syn',
        text: 'TCP SYN → SYN-ACK → ACK: port 443',
        type: 'success',
        baseDelay: 400,
      },
      {
        id: 'tls-session',
        text: 'Session cache check: PSK lookup for eve0415.net',
        type: 'info',
        baseDelay: 500,
      },
      {
        id: 'tls-clienthello',
        text: 'ClientHello 生成',
        type: 'group',
        baseDelay: 600,
        children: [
          { id: 'tls-ch-random', text: 'Random (32 bytes), legacy_version 0x0303', type: 'info', baseDelay: 620 },
          { id: 'tls-ch-versions', text: 'Supported Versions: TLS 1.3, fallback 1.2', type: 'info', baseDelay: 660 },
          { id: 'tls-ch-keyshare', text: 'KeyShare: x25519 ephemeral key generated', type: 'info', baseDelay: 700 },
          { id: 'tls-ch-ciphers', text: 'CipherSuites: AES-128-GCM, AES-256-GCM, CHACHA20', type: 'info', baseDelay: 740 },
          { id: 'tls-ch-ext', text: 'Extensions: SNI, ALPN (h2, http/1.1), OCSP request', type: 'info', baseDelay: 780 },
          { id: 'tls-ch-send', text: 'ClientHello 送信', type: 'success', baseDelay: 820 },
        ],
      },
      {
        id: 'tls-serverhello',
        text: 'ServerHello 受信',
        type: 'group',
        baseDelay: 900,
        children: [
          {
            id: 'tls-sh-select',
            text: ctx => `Selected: TLS 1.3, x25519, ${ctx.connection.tlsCipher}`,
            type: 'info',
            baseDelay: 920,
          },
          { id: 'tls-sh-keyshare', text: 'Server KeyShare received', type: 'info', baseDelay: 960 },
        ],
      },
      {
        id: 'tls-secrets',
        text: 'Handshake Secrets 導出',
        type: 'group',
        baseDelay: 1000,
        children: [
          { id: 'tls-sec-ecdhe', text: 'ECDHE shared secret computed', type: 'info', baseDelay: 1020 },
          { id: 'tls-sec-hkdf', text: 'Traffic keys derived (HKDF)', type: 'success', baseDelay: 1060 },
        ],
      },
      {
        id: 'tls-encext',
        text: 'EncryptedExtensions 復号',
        type: 'group',
        baseDelay: 1100,
        children: [
          {
            id: 'tls-ee-alpn',
            text: ctx => `ALPN: ${ctx.timing.protocol === 'h3' ? 'h3' : 'h2'} selected`,
            type: 'info',
            baseDelay: 1120,
          },
          { id: 'tls-ee-early', text: 'Early data: rejected (full handshake)', type: 'info', baseDelay: 1160 },
        ],
      },
      {
        id: 'tls-cert',
        text: 'Certificate 受信',
        type: 'group',
        baseDelay: 1200,
        children: [
          {
            id: 'tls-cert-leaf',
            text: ctx => `Leaf: CN=${ctx.connection.certCN}`,
            type: 'info',
            baseDelay: 1220,
          },
          {
            id: 'tls-cert-inter',
            text: ctx => `Intermediate: ${ctx.connection.certChain[0]}`,
            type: 'info',
            baseDelay: 1260,
          },
          { id: 'tls-cert-ocsp', text: 'OCSP staple: present', type: 'info', baseDelay: 1300 },
        ],
      },
      {
        id: 'tls-verify',
        text: '証明書検証',
        type: 'group',
        baseDelay: 1340,
        children: [
          {
            id: 'tls-v-chain',
            text: ctx => `Chain: leaf → ${ctx.connection.certChain.join(' → ')}`,
            type: 'info',
            baseDelay: 1360,
          },
          { id: 'tls-v-sig', text: 'Signature validation: ✓', type: 'success', baseDelay: 1400 },
          {
            id: 'tls-v-validity',
            text: ctx => `Validity: ${ctx.connection.certValidFrom} - ${ctx.connection.certValidTo}`,
            type: 'info',
            baseDelay: 1440,
          },
          {
            id: 'tls-v-san',
            text: ctx => `SAN check: ${ctx.connection.certCN} ✓`,
            type: 'success',
            baseDelay: 1480,
          },
          { id: 'tls-v-ku', text: 'Key usage: serverAuth ✓', type: 'success', baseDelay: 1520 },
          { id: 'tls-v-ocsp', text: 'OCSP status: good', type: 'success', baseDelay: 1560 },
          { id: 'tls-v-ct', text: 'CT SCTs: 2 verified', type: 'success', baseDelay: 1600 },
        ],
      },
      {
        id: 'tls-certverify',
        text: 'CertificateVerify 検証',
        type: 'info',
        baseDelay: 1640,
        children: [{ id: 'tls-cv-sig', text: 'Server signature over transcript: ✓', type: 'success', baseDelay: 1660 }],
      },
      {
        id: 'tls-finished',
        text: 'Finished 検証',
        type: 'info',
        baseDelay: 1700,
        children: [{ id: 'tls-fin-hmac', text: 'HMAC verification: ✓', type: 'success', baseDelay: 1720 }],
      },
      {
        id: 'tls-complete',
        text: ctx => `TLS Handshake complete (${ctx.timing.tls}ms)`,
        type: 'success',
        baseDelay: 1760,
      },
    ],
  },

  // HTTP group
  {
    id: 'http',
    text: 'HTTP',
    type: 'group',
    baseDelay: 1800,
    children: [
      {
        id: 'http-req',
        text: ctx => `GET ${ctx.path} ${ctx.timing.protocol === 'h3' ? 'HTTP/3' : 'HTTP/2'} 送信`,
        type: 'info',
        baseDelay: 1800,
      },
      {
        id: 'http-res',
        text: ctx => `${ctx.timing.protocol === 'h3' ? 'HTTP/3' : 'HTTP/2'} 404 Not Found`,
        type: 'warning',
        baseDelay: 1900,
      },
      {
        id: 'http-transfer',
        text: ctx => `Content-Encoding: br, Transfer: ${(ctx.timing.transferSize / 1024).toFixed(1)} KB`,
        type: 'info',
        baseDelay: 2000,
      },
      {
        id: 'http-ttfb',
        text: ctx => `TTFB: ${ctx.timing.ttfb}ms`,
        type: 'info',
        baseDelay: 2100,
      },
    ],
  },

  // Parse group
  {
    id: 'parse',
    text: 'HTML Parse',
    type: 'group',
    baseDelay: 2200,
    children: [
      {
        id: 'parse-start',
        text: ctx => `HTML パース開始... <!DOCTYPE ${ctx.dom.doctype}>`,
        type: 'info',
        baseDelay: 2200,
      },
      {
        id: 'parse-html',
        text: ctx => `<html lang="${ctx.dom.htmlLang}">`,
        type: 'info',
        baseDelay: 2300,
      },
      {
        id: 'parse-head',
        text: ctx => `<head> 解析中... ${ctx.dom.headElements} 要素発見`,
        type: 'info',
        baseDelay: 2400,
        children: [
          {
            id: 'parse-meta',
            text: ctx => {
              const charset = ctx.dom.meta.find(m => m.charset);
              return charset ? `<meta charset="${charset.charset}">` : '<meta charset="utf-8">';
            },
            type: 'info',
            baseDelay: 2420,
          },
          {
            id: 'parse-title',
            text: ctx => `<title>${ctx.dom.title || '404'}</title>`,
            type: 'info',
            baseDelay: 2460,
          },
          {
            id: 'parse-links',
            text: ctx => {
              const preconnects = ctx.dom.links.filter(l => l.rel === 'preconnect' || l.rel === 'dns-prefetch');
              return `${preconnects.length} preconnect/dns-prefetch hints`;
            },
            type: 'info',
            baseDelay: 2500,
          },
        ],
      },
    ],
  },

  // Resources group
  {
    id: 'resources',
    text: 'Resources',
    type: 'group',
    baseDelay: 2600,
    children: [
      {
        id: 'res-css',
        text: ctx => {
          const css = ctx.dom.stylesheets[0];
          if (!css?.href) return 'CSS inline styles found';
          const name = css.href.split('/').pop() || 'styles.css';
          return `CSS 取得中: ${name} (render-blocking)`;
        },
        type: 'info',
        baseDelay: 2600,
      },
      {
        id: 'res-cssom',
        text: 'CSSOM 構築中...',
        type: 'info',
        baseDelay: 2800,
      },
      {
        id: 'res-js',
        text: ctx => {
          const totalSize = ctx.timing.resources.filter(r => r.initiatorType === 'script').reduce((sum, r) => sum + r.decodedBodySize, 0);
          return `JavaScript 取得完了: ${(totalSize / 1024).toFixed(0) || '???'} KB`;
        },
        type: 'info',
        baseDelay: 3000,
      },
    ],
  },

  // Render group
  {
    id: 'render',
    text: 'Render',
    type: 'group',
    baseDelay: 3200,
    children: [
      {
        id: 'render-dom',
        text: ctx => `DOM 構築完了: ${ctx.dom.totalNodes} nodes`,
        type: 'success',
        baseDelay: 3200,
      },
      {
        id: 'render-tree',
        text: 'Render Tree 生成: DOM + CSSOM',
        type: 'info',
        baseDelay: 3400,
      },
      {
        id: 'render-layout',
        text: 'Layout 計算中... (reflow)',
        type: 'info',
        baseDelay: 3600,
      },
      {
        id: 'render-paint',
        text: 'Paint 処理... (rasterize)',
        type: 'info',
        baseDelay: 3800,
      },
      {
        id: 'render-fcp',
        text: 'FCP: SSR コンテンツ表示',
        type: 'success',
        baseDelay: 4000,
      },
    ],
  },

  // Hydration group
  {
    id: 'hydrate',
    text: 'Hydration',
    type: 'group',
    baseDelay: 4200,
    children: [
      {
        id: 'hydrate-start',
        text: 'JavaScript 実行開始...',
        type: 'info',
        baseDelay: 4200,
      },
      {
        id: 'hydrate-react',
        text: 'React Hydration: hydrateRoot()',
        type: 'info',
        baseDelay: 4400,
      },
      {
        id: 'hydrate-error',
        text: '[ERROR] Hydration 失敗: RouteNotFound',
        type: 'error',
        baseDelay: 4600,
      },
      {
        id: 'hydrate-critical',
        text: '[CRITICAL] React: Unrecoverable Error',
        type: 'error',
        baseDelay: 4800,
      },
    ],
  },
];

// Progress bar stages - browser loading phases
export const PROGRESS_STAGES: ProgressStage[] = [
  { label: 'Network', duration: 500, startAt: 0 },
  { label: 'TLS', duration: 1300, startAt: 500 },
  { label: 'HTTP', duration: 400, startAt: 1800 },
  { label: 'Parse', duration: 400, startAt: 2200 },
  { label: 'Resources', duration: 600, startAt: 2600 },
  { label: 'Render', duration: 1000, startAt: 3200 },
  { label: 'Hydrate', duration: 800, startAt: 4200 },
];

// Get the total duration of boot sequence (base, before scaling)
export const BASE_BOOT_DURATION = 5000; // 5 seconds base

// Legacy exports for compatibility during transition
export type { BootMessage as LegacyBootMessage };
export { createBootMessages as BOOT_MESSAGES_FACTORY };
