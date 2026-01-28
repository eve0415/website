/* oxlint-disable typescript-eslint(no-unsafe-type-assertion) -- Test file uses type assertions for Route.options internal structure */
import { describe, expect, test } from 'vitest';

import { Route } from './__root';

interface MetaTag {
  charSet?: string;
  title?: string;
  name?: string;
  property?: string;
  content?: string;
  httpEquiv?: string;
}

interface LinkTag {
  rel?: string;
  type?: string;
  sizes?: string;
  href?: string;
}

interface ScriptTag {
  src?: string;
  type?: string;
  nonce?: string;
}

type HeadFn = (params: { match: { context: { cspNonce?: string } } }) => { meta: MetaTag[]; links: LinkTag[]; scripts?: ScriptTag[] };

// Mock match object for head() function
const mockMatch = { context: {} as { cspNonce?: string } };

describe('__root Route', () => {
  test('route is defined', () => {
    expect(Route).toBeDefined();
  });

  describe('head()', () => {
    test('returns meta tags with correct structure', () => {
      const headFn = Route.options.head as HeadFn;
      expect(headFn).toBeDefined();

      const head = headFn({ match: mockMatch });

      expect(head.meta).toBeDefined();
      expect(Array.isArray(head.meta)).toBeTruthy();
    });

    test('includes charset meta tag', () => {
      const head = (Route.options.head as HeadFn)({ match: mockMatch });

      const charsetMeta = head.meta.find((m: MetaTag) => m.charSet);
      expect(charsetMeta).toStrictEqual({ charSet: 'utf8' });
    });

    test('includes viewport meta tag', () => {
      const head = (Route.options.head as HeadFn)({ match: mockMatch });

      const viewportMeta = head.meta.find((m: MetaTag) => m.name === 'viewport');
      expect(viewportMeta).toStrictEqual({
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      });
    });

    test('includes title meta tag', () => {
      const head = (Route.options.head as HeadFn)({ match: mockMatch });

      const titleMeta = head.meta.find((m: MetaTag) => m.title);
      expect(titleMeta).toStrictEqual({ title: 'eve0415' });
    });

    test('includes description meta tag', () => {
      const head = (Route.options.head as HeadFn)({ match: mockMatch });

      const descMeta = head.meta.find((m: MetaTag) => m.name === 'description');
      expect(descMeta).toStrictEqual({
        name: 'description',
        content: 'eve0415 - エンジニア',
      });
    });

    test('includes theme-color meta tag', () => {
      const head = (Route.options.head as HeadFn)({ match: mockMatch });

      const themeColorMeta = head.meta.find((m: MetaTag) => m.name === 'theme-color');
      expect(themeColorMeta).toStrictEqual({
        name: 'theme-color',
        content: '#0a0a0a',
      });
    });

    test('includes Open Graph meta tags', () => {
      const head = (Route.options.head as HeadFn)({ match: mockMatch });

      const ogTitle = head.meta.find((m: MetaTag) => m.property === 'og:title');
      expect(ogTitle).toStrictEqual({ property: 'og:title', content: 'eve0415' });

      const ogDesc = head.meta.find((m: MetaTag) => m.property === 'og:description');
      expect(ogDesc).toStrictEqual({ property: 'og:description', content: 'eve0415 - エンジニア' });

      const ogType = head.meta.find((m: MetaTag) => m.property === 'og:type');
      expect(ogType).toStrictEqual({ property: 'og:type', content: 'website' });

      const ogUrl = head.meta.find((m: MetaTag) => m.property === 'og:url');
      expect(ogUrl).toStrictEqual({ property: 'og:url', content: 'https://eve0415.net' });
    });

    test('includes Twitter card meta tags', () => {
      const head = (Route.options.head as HeadFn)({ match: mockMatch });

      const twitterCard = head.meta.find((m: MetaTag) => m.name === 'twitter:card');
      expect(twitterCard).toStrictEqual({ name: 'twitter:card', content: 'summary_large_image' });

      const twitterSite = head.meta.find((m: MetaTag) => m.name === 'twitter:site');
      expect(twitterSite).toStrictEqual({ name: 'twitter:site', content: '@eveevekun' });
    });

    test('includes link tags', () => {
      const head = (Route.options.head as HeadFn)({ match: mockMatch });

      expect(head.links).toBeDefined();
      expect(Array.isArray(head.links)).toBeTruthy();

      const faviconLink = head.links.find((l: LinkTag) => l.rel === 'icon');
      expect(faviconLink).toStrictEqual({ rel: 'icon', type: 'image/png', sizes: '96x96', href: '/favicon-96x96.png' });

      const canonicalLink = head.links.find((l: LinkTag) => l.rel === 'canonical');
      expect(canonicalLink).toStrictEqual({ rel: 'canonical', href: 'https://eve0415.net' });

      // Stylesheet link exists (URL is transformed by Vite at build time)
      const stylesheetLink = head.links.find((l: LinkTag) => l.rel === 'stylesheet');
      expect(stylesheetLink).toBeDefined();
      expect(stylesheetLink?.href).toBeDefined();
    });
  });
});
