import { expect, it } from 'vitest';

import { PAGES, htmlFiles } from './client-output';

it('expects both locales of all ten routes', () => {
  expect(PAGES).toHaveLength(20);
});

it('prerenders exactly those pages, at the paths autoSubfolderIndex: false writes', () => {
  expect(htmlFiles().toSorted()).toStrictEqual(PAGES.map(page => page.file).toSorted());
});
