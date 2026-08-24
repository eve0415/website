import { describe, expect, it } from 'vitest';

import { DEFAULT_LOCALE, LOCALES } from '#i18n/locale';

import { PAGES, pageUrl, read } from './client-output';

/**
 * Scoped to `<head>` because the body carries `<a hrefLang>` links of its own,
 * and read with `node:fs` rather than grepped: the markup is one enormous line
 * and carries NUL bytes inside TanStack's serialised route ids, so `grep` calls
 * it binary.
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

const linksIn = (head: string): Map<string, string>[] => [...head.matchAll(/<link\b[^>]*>/gu)].map(tag => attributesOf(tag[0]));

describe.each(PAGES)('$file', page => {
  const links = linksIn(headOf(page.file));

  it('carries exactly one canonical, and it points at this page', () => {
    expect(links.filter(link => link.get('rel') === 'canonical').map(link => link.get('href'))).toStrictEqual([page.url]);
  });

  // React renders the property, so the attribute is `hrefLang`; a /hreflang=/
  // regex matches nothing at all here.
  it('carries both locales plus an x-default pointing at Japanese', () => {
    const cluster = links.filter(link => link.get('rel') === 'alternate' && link.has('hrefLang'));

    expect(cluster.map(link => [link.get('hrefLang'), link.get('href')])).toStrictEqual([
      ...LOCALES.map(locale => [locale, pageUrl(locale, page.route)]),
      ['x-default', pageUrl(DEFAULT_LOCALE, page.route)],
    ]);
  });

  it('carries a non-empty title', () => {
    const [, title = ''] = /<title>([^<]*)<\/title>/u.exec(headOf(page.file)) ?? [];

    expect(title.length).toBeGreaterThan(0);
  });
});
