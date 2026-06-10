import type { DOMScanData } from './useDomScan';
import type { NavigationTimingData } from './useNavigationTiming';

// --- Navigation Timing Fixtures ---

/**
 * Fast connection timing (~200ms total)
 * Simulates optimal local/CDN response
 */
export const fastTiming: NavigationTimingData = {
  dns: 5,
  tcp: 10,
  tls: 20,
  ttfb: 50,
  download: 100,
  total: 185,
  transferSize: 15_000,
  encodedBodySize: 14_500,
  decodedBodySize: 45_000,
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
  raw: null,
};

// --- DOM Scan Fixtures ---

/**
 * Mock DOM scan with typical SPA structure
 */
export const mockDOMScan: DOMScanData = {
  totalNodes: 150,
  headElements: 20,
  bodyElements: 130,
  doctype: 'html',
  htmlLang: 'ja',
  title: 'ページが見つかりません | eve0415.net',
  elements: [
    { tagName: 'div', count: 45, examples: ['<div class="container">', '<div id="root">'] },
    { tagName: 'span', count: 28, examples: ['<span class="text-neon">', '<span class="label">'] },
    { tagName: 'script', count: 8, examples: ['<script src="/assets/main.js">', '<script type="module">'] },
    { tagName: 'link', count: 6, examples: ['<link rel="stylesheet" href="/styles.css">', '<link rel="icon">'] },
    { tagName: 'meta', count: 12, examples: ['<meta name="viewport">', '<meta name="description">'] },
    { tagName: 'button', count: 5, examples: ['<button type="button">', '<button class="btn">'] },
    { tagName: 'a', count: 8, examples: ['<a href="/">', '<a href="/about">'] },
  ],
  scripts: [
    { src: '/assets/main.js', type: 'module', async: false, defer: false, isInline: false },
    { src: null, type: 'application/json', async: false, defer: false, isInline: true },
  ],
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
