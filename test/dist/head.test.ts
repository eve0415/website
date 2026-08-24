import { describe, expect, it } from 'vitest';

import { PAGES, read } from './client-output';

/**
 * Scoped to `<head>` so "exactly one canonical" is a claim about the head rather
 * than the document, and read with `node:fs` rather than grepped: the markup is
 * one enormous line and carries NUL bytes inside TanStack's serialised route
 * ids, so `grep` calls it binary.
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

/**
 * Read per test rather than once in the `describe` body: a page missing from
 * `dist/` throws, and thrown during collection that takes every test in this
 * file out of the run — 60 of them silently becoming zero, which is the one
 * failure these tests cannot see. Inside an `it` it is a red test instead.
 */
const linksOf = (file: string): Map<string, string>[] => [...headOf(file).matchAll(/<link\b[^>]*>/gu)].map(tag => attributesOf(tag[0]));

describe.each(PAGES)('$file', page => {
  it('carries exactly one canonical, and it points at this page', () => {
    expect(
      linksOf(page.file)
        .filter(link => link.get('rel') === 'canonical')
        .map(link => link.get('href')),
    ).toStrictEqual([page.url]);
  });

  // React renders the property, so the attribute is `hrefLang`; a /hreflang=/
  // regex matches nothing at all here, in the head or in the body's own `<a>`s.
  it('carries both locales plus an x-default pointing at Japanese', () => {
    const cluster = linksOf(page.file).filter(link => link.get('rel') === 'alternate' && link.has('hrefLang'));

    expect(cluster.map(link => [link.get('hrefLang'), link.get('href')])).toStrictEqual(page.alternates);
  });

  it('carries a non-empty title', () => {
    const [, title = ''] = /<title>([^<]*)<\/title>/u.exec(headOf(page.file)) ?? [];

    expect(title.length).toBeGreaterThan(0);
  });
});
