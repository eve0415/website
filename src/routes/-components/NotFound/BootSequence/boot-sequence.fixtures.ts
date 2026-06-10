import type { DOMScanData } from './useDomScan';
import type { NavigationTimingData } from './useNavigationTiming';

// --- Navigation Timing Fixtures ---

/**
 * Fast connection timing (~200ms total)
 * Simulates optimal local/CDN response
 */
export const fastTiming: NavigationTimingData = {
  dns: 5,
  tls: 20,
  ttfb: 50,
  total: 185,
  transferSize: 15_000,
  protocol: 'h2',
  resources: [
    {
      name: 'https://eve0415.net/assets/main.js',
      initiatorType: 'script',
      transferSize: 50_000,
      decodedBodySize: 150_000,
      duration: 45,
      protocol: 'h2',
    },
    {
      name: 'https://eve0415.net/assets/styles.css',
      initiatorType: 'link',
      transferSize: 8000,
      decodedBodySize: 25_000,
      duration: 30,
      protocol: 'h2',
    },
  ],
};

// --- DOM Scan Fixtures ---

/**
 * Mock DOM scan with typical SPA structure
 */
export const mockDOMScan: DOMScanData = {
  totalNodes: 150,
  headElements: 20,
  doctype: 'html',
  htmlLang: 'ja',
  title: 'ページが見つかりません | eve0415.net',
  stylesheets: [
    { href: '/assets/styles.css', media: 'all', isInline: false },
    { href: null, media: 'all', isInline: true },
  ],
  meta: [
    { name: 'viewport', property: null, content: 'width=device-width, initial-scale=1', charset: null },
    { name: 'description', property: null, content: 'Personal website of eve0415', charset: null },
    { name: null, property: 'og:title', content: 'eve0415.net', charset: null },
    { name: null, property: null, content: '', charset: 'utf8' },
  ],
  links: [
    { rel: 'icon', href: '/favicon.ico', type: 'image/x-icon' },
    { rel: 'canonical', href: 'https://eve0415.net', type: null },
  ],
};
