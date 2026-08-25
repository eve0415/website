import { expect, it } from 'vitest';

import { PAGES, read } from './client-output';

/**
 * Artifact-only, and one claim rather than three per page.
 *
 * `src/i18n/head.test.ts` already pins `localeHead`'s output against literal
 * URLs at 100% — the canonical, the whole hreflang cluster and the title text all
 * come from there. What that cannot see is whether the route ever asked for it:
 * `localeHead` is spread into each route's `head()` by hand, ten routes over two
 * locales, and a route that forgot to would render a page with no canonical while
 * every source test stayed green.
 *
 * So the claim here is "the head was wired in", which is one thing about twenty
 * pages, not sixty things. Collapsed to three assertions that name the offending
 * page in their diff; the ×20 was multiplication, not coverage.
 */
const headOf = (file: string): string => {
  const html = read(file);
  const start = html.indexOf('<head>');
  const end = html.indexOf('</head>');
  if (start === -1 || end === -1) throw new Error(`${file} has no <head>`);

  return html.slice(start, end);
};

const attributesOf = (tag: string): Map<string, string> =>
  new Map(
    [...tag.matchAll(/([A-Za-z][\w-]*)="([^"]*)"/gu)].map((match): [string, string] => {
      const [, name = '', value = ''] = match;

      return [name, value];
    }),
  );

const linksOf = (file: string): Map<string, string>[] => [...headOf(file).matchAll(/<link\b[^>]*>/gu)].map(tag => attributesOf(tag[0]));

/**
 * Read inside each `it` rather than in the module body: a page missing from
 * `dist/` throws, and thrown during collection that takes every test in this
 * file out of the run silently rather than turning it red.
 */
it('carries exactly one canonical per page, pointing at that page', () => {
  const found = PAGES.map(page => ({
    file: page.file,
    canonical: linksOf(page.file)
      .filter(link => link.get('rel') === 'canonical')
      .map(link => link.get('href')),
  }));

  expect(found).toStrictEqual(PAGES.map(page => ({ file: page.file, canonical: [page.url] })));
});

// React renders the property, so the attribute is `hrefLang`; a /hreflang=/
// regex matches nothing at all here, in the head or in the body's own `<a>`s.
it('carries both locales plus an x-default pointing at Japanese, on every page', () => {
  const found = PAGES.map(page => ({
    file: page.file,
    cluster: linksOf(page.file)
      .filter(link => link.get('rel') === 'alternate' && link.has('hrefLang'))
      .map(link => [link.get('hrefLang'), link.get('href')]),
  }));

  expect(found).toStrictEqual(PAGES.map(page => ({ file: page.file, cluster: page.alternates })));
});

it('carries a non-empty title on every page', () => {
  const empty = PAGES.filter(page => {
    const [, title = ''] = /<title>([^<]*)<\/title>/u.exec(headOf(page.file)) ?? [];

    return title.length === 0;
  });

  expect(empty.map(page => page.file)).toStrictEqual([]);
});
