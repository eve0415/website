import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { expect, it } from 'vitest';

/**
 * `public/site.webmanifest` and the icons it names are both source files that
 * `vite build` copies verbatim, so this needs no build: the manifest's `src`
 * values are checked against `public/` itself.
 *
 * The copy is what `test/dist/asset-refs.test.ts` still covers, through every
 * page's `<link rel="manifest">`.
 */
const PUBLIC_DIR = 'public';

it('names icons that all exist in public/', () => {
  const manifest = readFileSync(path.join(PUBLIC_DIR, 'site.webmanifest'), 'utf8');
  const icons = [...manifest.matchAll(/"src":\s*"([^"]+)"/gu)].map(([, src = '']) => src);

  expect(icons.length).toBeGreaterThan(0);
  expect(icons.filter(src => !existsSync(path.join(PUBLIC_DIR, src.slice(1))))).toStrictEqual([]);
});
