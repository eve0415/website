import { expect, it } from 'vitest';

import { PAGES, exists, htmlFiles } from './client-output';

it('expects both locales of all ten routes', () => {
  expect(PAGES).toHaveLength(20);
});

// Artifact-only: `satisfies Record<RoutePath, true>` on `ROUTE_SET` is a
// compile-time check on the route list, and says nothing about where
// `autoSubfolderIndex: false` puts each file. Left at its default the prerender
// writes `x/index.html`, which the asset worker 307s to `x/`, so every
// slash-free canonical would point at a redirect.
it('prerenders exactly those pages, at the paths autoSubfolderIndex: false writes', () => {
  expect(htmlFiles().toSorted()).toStrictEqual(PAGES.map(page => page.file).toSorted());
});

// Artifact-only: `test/source/` proves both plugins emit the right document and
// that they only apply to the client environment, but not that the client
// environment's output is what lands in `dist/client`.
it('lands the generated sitemap and _headers in the client build', () => {
  expect(['sitemap.xml', '_headers'].filter(file => !exists(file))).toStrictEqual([]);
});
