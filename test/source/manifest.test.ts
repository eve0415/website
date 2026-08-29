import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { expect, it } from 'vitest';

import { MIDNIGHT } from '#routes/{-$locale}/-/sky/palette';

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

/**
 * The manifest is the third place the page's one opaque colour is written, and
 * the only one no build step derives: `__root.css` reads `--sky-root-solid` and
 * `__root.tsx` reads `MIDNIGHT.rootSolid`, while this file is static JSON that
 * `vite build` copies verbatim. It is also the one that matters in standalone,
 * where the OS reads the manifest and not the meta — `theme_color` for the
 * chrome and `background_color` for the splash the app launches into.
 *
 * Hex here against `rgb()` there, because a manifest colour is parsed by the
 * OS rather than by a browser's CSS engine. Compared as triplets so the two
 * notations do not have to agree, only the colour.
 */
const triplet = (colour: string): [number, number, number] => {
  const hex = /^#(?<r>[0-9a-f]{2})(?<g>[0-9a-f]{2})(?<b>[0-9a-f]{2})$/iu.exec(colour)?.groups;
  if (hex) return [Number.parseInt(hex['r'] ?? '', 16), Number.parseInt(hex['g'] ?? '', 16), Number.parseInt(hex['b'] ?? '', 16)];

  const [r = 0, g = 0, b = 0] = colour
    .replaceAll(/^rgb\(|\)$/gu, '')
    .split(',')
    .map(Number);
  return [r, g, b];
};

/** The manifest's value for one key, read off the text rather than through a parse that would hand back `any`. */
const colour = (manifest: string, key: string): string => new RegExp(`"${key}":\\s*"([^"]+)"`, 'u').exec(manifest)?.[1] ?? '';

it('paints its chrome and splash the colour the document carries', () => {
  const manifest = readFileSync(path.join(PUBLIC_DIR, 'site.webmanifest'), 'utf8');

  expect({ theme: triplet(colour(manifest, 'theme_color')), background: triplet(colour(manifest, 'background_color')) }).toStrictEqual({
    theme: triplet(MIDNIGHT.rootSolid),
    background: triplet(MIDNIGHT.rootSolid),
  });
});
