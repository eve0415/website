/* oxlint-disable typescript-eslint(no-unsafe-type-assertion) -- Test fixtures require type assertions for mock data */
import type { CertificatePack, ConnectionInfo } from './connection-info';
import type { DOMScanData, MetaInfo, ScriptInfo, StylesheetInfo } from './useDomScan';
import type { NavigationTimingData, ResourceTimingEntry } from './useNavigationTiming';

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

/**
 * Slow connection timing (~2000ms total)
 * Simulates poor mobile or overseas connection
 */
export const slowTiming: NavigationTimingData = {
  dns: 200,
  tcp: 300,
  tls: 400,
  ttfb: 500,
  download: 600,
  total: 2000,
  transferSize: 150_000,
  encodedBodySize: 145_000,
  decodedBodySize: 450_000,
  protocol: 'h2',
  resources: [
    {
      name: 'https://eve0415.net/assets/main.js',
      initiatorType: 'script',
      transferSize: 500_000,
      decodedBodySize: 1_500_000,
      duration: 800,
      protocol: 'h2',
    },
    {
      name: 'https://eve0415.net/assets/styles.css',
      initiatorType: 'link',
      transferSize: 80_000,
      decodedBodySize: 250_000,
      duration: 400,
      protocol: 'h2',
    },
  ],
  raw: null,
};

/**
 * HTTP/3 connection timing
 * Simulates newer protocol with improved performance
 */
export const http3Timing: NavigationTimingData = {
  dns: 3,
  tcp: 0, // QUIC doesn't use TCP
  tls: 8, // 0-RTT in QUIC
  ttfb: 35,
  download: 80,
  total: 126,
  transferSize: 15_000,
  encodedBodySize: 14_500,
  decodedBodySize: 45_000,
  protocol: 'h3',
  resources: [],
  raw: null,
};

/**
 * Zero timing (default/cached)
 */
export const zeroTiming: NavigationTimingData = {
  dns: 0,
  tcp: 0,
  tls: 0,
  ttfb: 0,
  download: 0,
  total: 0,
  transferSize: 0,
  encodedBodySize: 0,
  decodedBodySize: 0,
  protocol: 'h2',
  resources: [],
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
  ] as ScriptInfo[],
  stylesheets: [
    { href: '/assets/styles.css', media: 'all', isInline: false },
    { href: null, media: 'all', isInline: true },
  ] as StylesheetInfo[],
  meta: [
    { name: 'viewport', property: null, content: 'width=device-width, initial-scale=1', charset: null },
    { name: 'description', property: null, content: 'Personal website of eve0415', charset: null },
    { name: null, property: 'og:title', content: 'eve0415.net', charset: null },
    { name: null, property: null, content: '', charset: 'utf8' },
  ] as MetaInfo[],
  links: [
    { rel: 'icon', href: '/favicon.ico', type: 'image/x-icon' },
    { rel: 'canonical', href: 'https://eve0415.net', type: null },
  ],
};

/**
 * Minimal DOM scan (mostly empty page)
 */
export const minimalDOMScan: DOMScanData = {
  totalNodes: 15,
  headElements: 5,
  bodyElements: 10,
  doctype: 'html',
  htmlLang: 'ja',
  title: '',
  elements: [
    { tagName: 'div', count: 5, examples: ['<div id="root">'] },
    { tagName: 'meta', count: 3, examples: ['<meta charset="utf-8">'] },
  ],
  scripts: [],
  stylesheets: [],
  meta: [{ name: null, property: null, content: '', charset: 'utf8' }],
  links: [],
};

/**
 * Heavy DOM scan (complex page)
 */
export const heavyDOMScan: DOMScanData = {
  totalNodes: 500,
  headElements: 50,
  bodyElements: 450,
  doctype: 'html',
  htmlLang: 'ja',
  title: 'Complex Page | eve0415.net',
  elements: [
    { tagName: 'div', count: 150, examples: ['<div class="card">', '<div class="modal">'] },
    { tagName: 'span', count: 80, examples: ['<span class="icon">', '<span class="badge">'] },
    { tagName: 'li', count: 45, examples: ['<li class="list-item">', '<li class="nav-item">'] },
    { tagName: 'svg', count: 30, examples: ['<svg class="icon">', '<svg viewBox="0 0 24 24">'] },
    { tagName: 'path', count: 60, examples: [] },
  ],
  scripts: [
    { src: '/assets/main.js', type: 'module', async: false, defer: false, isInline: false },
    { src: '/assets/vendor.js', type: 'module', async: true, defer: false, isInline: false },
    { src: '/assets/analytics.js', type: 'text/javascript', async: true, defer: false, isInline: false },
  ],
  stylesheets: [
    { href: '/assets/styles.css', media: 'all', isInline: false },
    { href: '/assets/print.css', media: 'print', isInline: false },
    { href: null, media: 'all', isInline: true },
  ],
  meta: [
    { name: 'viewport', property: null, content: 'width=device-width, initial-scale=1', charset: null },
    { name: 'description', property: null, content: 'Complex page with many elements', charset: null },
  ],
  links: [],
};

// --- Connection Info Fixtures ---

/**
 * Helper to create mock certificate pack with specified number of certs
 */
const createMockCertPack = (certCount: number): CertificatePack | null => {
  if (certCount === 0) return null;

  return {
    id: 'mock-cert-pack-id',
    type: 'universal',
    hosts: ['eve0415.net', '*.eve0415.net'],
    status: 'active',
    certificates: Array.from({ length: certCount }, (_, i) => ({
      id: `cert-${i}`,
      hosts: i === 0 ? ['eve0415.net', '*.eve0415.net'] : undefined,
      issuer: i === 0 ? 'Cloudflare Inc' : `Intermediate CA ${i}`,
      uploaded_on: '2024-01-01T00:00:00Z',
      expires_on: '2025-03-01T00:00:00Z',
      signature: 'SHA256WithRSA',
      bundle_method: 'ubiquitous',
    })),
  } as CertificatePack;
};

/**
 * 1-certificate chain (leaf only)
 */
export const singleCertPack = createMockCertPack(1);

/**
 * 2-certificate chain (leaf + 1 intermediate)
 */
export const twoCertPack = createMockCertPack(2);

/**
 * 3-certificate chain (leaf + 2 intermediates)
 */
export const threeCertPack = createMockCertPack(3);

/**
 * Standard Cloudflare connection with 2-cert chain
 */
export const mockConnection: ConnectionInfo = {
  serverIp: '104.21.48.170',
  tlsVersion: 'TLSv1.3',
  tlsCipher: 'TLS_AES_128_GCM_SHA256',
  httpVersion: 'h2',
  cfRay: '8abc123def456789-NRT',
  colo: 'NRT',
  certificatePack: twoCertPack,
};

/**
 * Connection without Cloudflare headers
 */
export const basicConnection: ConnectionInfo = {
  serverIp: '192.168.1.1',
  tlsVersion: 'TLSv1.2',
  tlsCipher: 'TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384',
  httpVersion: 'http/1.1',
  cfRay: null,
  colo: null,
  certificatePack: singleCertPack,
};

/**
 * HTTP/3 connection
 */
export const http3Connection: ConnectionInfo = {
  serverIp: '104.21.48.170',
  tlsVersion: 'TLSv1.3',
  tlsCipher: 'TLS_AES_256_GCM_SHA384',
  httpVersion: 'h3',
  cfRay: '8abc123def456789-NRT',
  colo: 'NRT',
  certificatePack: threeCertPack,
};

/**
 * Connection with no certificate pack (null)
 */
export const noCertConnection: ConnectionInfo = {
  serverIp: '104.21.48.170',
  tlsVersion: 'TLSv1.3',
  tlsCipher: 'TLS_AES_128_GCM_SHA256',
  httpVersion: 'h2',
  cfRay: null,
  colo: null,
  certificatePack: null,
};

// --- Resource Timing Fixtures ---

/**
 * Example resource entries for testing
 */
export const mockResources: ResourceTimingEntry[] = [
  {
    name: 'https://eve0415.net/assets/main.abc123.js',
    initiatorType: 'script',
    transferSize: 52_340,
    decodedBodySize: 156_200,
    duration: 45,
    protocol: 'h2',
  },
  {
    name: 'https://eve0415.net/assets/styles.def456.css',
    initiatorType: 'link',
    transferSize: 8120,
    decodedBodySize: 28_400,
    duration: 28,
    protocol: 'h2',
  },
  {
    name: 'https://fonts.googleapis.com/css2?family=Inter',
    initiatorType: 'link',
    transferSize: 1240,
    decodedBodySize: 3600,
    duration: 120,
    protocol: 'h2',
  },
  {
    name: 'https://eve0415.net/assets/logo.svg',
    initiatorType: 'img',
    transferSize: 2100,
    decodedBodySize: 5800,
    duration: 15,
    protocol: 'h2',
  },
];

// --- Composite Test Scenarios ---

/**
 * Fast user scenario - good connection, light page
 */
export const fastUserScenario = {
  timing: fastTiming,
  dom: mockDOMScan,
  connection: mockConnection,
};

/**
 * Slow user scenario - poor connection, heavy page
 */
export const slowUserScenario = {
  timing: slowTiming,
  dom: heavyDOMScan,
  connection: basicConnection,
};

/**
 * Modern user scenario - HTTP/3, optimized
 */
export const modernUserScenario = {
  timing: http3Timing,
  dom: mockDOMScan,
  connection: http3Connection,
};
