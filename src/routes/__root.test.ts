import { describe, expect, test } from 'vitest';

import { Route } from './__root';

type HeadFn = (params: { match: { context: { cspNonce?: string } } }) => { meta: any[]; links: any[]; scripts?: any[] };

// Mock match object for head() function
const mockMatch = { context: {} as { cspNonce?: string } };

describe('__root Route', () => {
  test('Route is defined', () => {
    expect(Route).toBeDefined();
  });

  describe('head()', () => {
    test('returns meta tags with correct structure', () => {
      const headFn = Route.options.head as HeadFn;
      expect(headFn).toBeDefined();

      const head = headFn({ match: mockMatch });

      expect(head.meta).toBeDefined();
      expect(Array.isArray(head.meta)).toBe(true);
    });

    test('includes charset meta tag', () => {
      const head = (Route.options.head as HeadFn)({ match: mockMatch });

      const charsetMeta = head.meta.find((m: { charSet?: string }) => m.charSet);
      expect(charsetMeta).toEqual({ charSet: 'utf-8' });
    });

    test('includes viewport meta tag', () => {
      const head = (Route.options.head as HeadFn)({ match: mockMatch });

      const viewportMeta = head.meta.find((m: { name?: string }) => m.name === 'viewport');
      expect(viewportMeta).toEqual({
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      });
    });

    test('includes title meta tag', () => {
      const head = (Route.options.head as HeadFn)({ match: mockMatch });

      const titleMeta = head.meta.find((m: { title?: string }) => m.title);
      expect(titleMeta).toEqual({ title: 'eve0415' });
    });

    test('includes description meta tag', () => {
      const head = (Route.options.head as HeadFn)({ match: mockMatch });

      const descMeta = head.meta.find((m: { name?: string }) => m.name === 'description');
      expect(descMeta).toEqual({
        name: 'description',
        content: 'eve0415 - エンジニア',
      });
    });

    test('includes theme-color meta tag', () => {
      const head = (Route.options.head as HeadFn)({ match: mockMatch });

      const themeColorMeta = head.meta.find((m: { name?: string }) => m.name === 'theme-color');
      expect(themeColorMeta).toEqual({
        name: 'theme-color',
        content: '#0a0a0a',
      });
    });

    test('includes Open Graph meta tags', () => {
      const head = (Route.options.head as HeadFn)({ match: mockMatch });

      const ogTitle = head.meta.find((m: { property?: string }) => m.property === 'og:title');
      expect(ogTitle).toEqual({ property: 'og:title', content: 'eve0415' });

      const ogDesc = head.meta.find((m: { property?: string }) => m.property === 'og:description');
      expect(ogDesc).toEqual({ property: 'og:description', content: 'eve0415 - エンジニア' });

      const ogType = head.meta.find((m: { property?: string }) => m.property === 'og:type');
      expect(ogType).toEqual({ property: 'og:type', content: 'website' });

      const ogUrl = head.meta.find((m: { property?: string }) => m.property === 'og:url');
      expect(ogUrl).toEqual({ property: 'og:url', content: 'https://eve0415.net' });
    });

    test('includes Twitter card meta tags', () => {
      const head = (Route.options.head as HeadFn)({ match: mockMatch });

      const twitterCard = head.meta.find((m: { name?: string }) => m.name === 'twitter:card');
      expect(twitterCard).toEqual({ name: 'twitter:card', content: 'summary_large_image' });

      const twitterSite = head.meta.find((m: { name?: string }) => m.name === 'twitter:site');
      expect(twitterSite).toEqual({ name: 'twitter:site', content: '@eveevekun' });
    });

    test('includes link tags', () => {
      const head = (Route.options.head as HeadFn)({ match: mockMatch });

      expect(head.links).toBeDefined();
      expect(Array.isArray(head.links)).toBe(true);

      const faviconLink = head.links.find((l: { rel?: string }) => l.rel === 'icon');
      expect(faviconLink).toEqual({ rel: 'icon', type: 'image/png', sizes: '96x96', href: '/favicon-96x96.png' });

      const canonicalLink = head.links.find((l: { rel?: string }) => l.rel === 'canonical');
      expect(canonicalLink).toEqual({ rel: 'canonical', href: 'https://eve0415.net' });

      // Stylesheet link exists (URL is transformed by Vite at build time)
      const stylesheetLink = head.links.find((l: { rel?: string }) => l.rel === 'stylesheet');
      expect(stylesheetLink).toBeDefined();
      expect(stylesheetLink.href).toBeDefined();
    });
  });
});
