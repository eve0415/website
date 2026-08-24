import type { Locale } from '#i18n/locale';

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

import { PAGE_COPY } from '#i18n/copy';
import { SITE_URL } from '#i18n/head';
import { DEFAULT_LOCALE, LOCALES, localePath } from '#i18n/locale';

/** What `vite build` writes, and what Cloudflare's asset server answers from. */
const CLIENT_DIR = 'dist/client';

// Thrown at import time rather than skipped: a suite that reports zero tests
// when the build is missing would be the one failure these tests cannot see.
if (!existsSync(CLIENT_DIR)) {
  throw new Error(`${CLIENT_DIR} is missing. These tests assert over the built output — run \`pnpm build\` first.`);
}

/** Exactly `RoutePath`: the copy record `satisfies Record<Locale, Record<RoutePath, …>>`. */
const ROUTES = Object.keys(PAGE_COPY[DEFAULT_LOCALE]);

/** A route's URL in one locale, which is also what its canonical must say. */
export const pageUrl = (locale: Locale, route: string): string => `${SITE_URL}${localePath(locale, route)}`;

export interface Page {
  route: string;
  url: string;
  /** Where `autoSubfolderIndex: false` writes it, relative to `dist/client`. */
  file: string;
}

const pageOf = (locale: Locale, route: string): Page => {
  const served = localePath(locale, route);

  return { route, url: pageUrl(locale, route), file: served === '/' ? 'index.html' : `${served.slice(1)}.html` };
};

/** Every page the site prerenders, Japanese first for each route. */
export const PAGES: Page[] = ROUTES.flatMap(route => LOCALES.map(locale => pageOf(locale, route)));

export const exists = (file: string): boolean => existsSync(path.join(CLIENT_DIR, file));

export const read = (file: string): string => readFileSync(path.join(CLIENT_DIR, file), 'utf8');

/** Paths of every built file with this extension, relative to `dist/client`. */
const filesWithExtension = (extension: string): string[] =>
  readdirSync(CLIENT_DIR, { recursive: true, withFileTypes: true })
    .filter(entry => entry.isFile() && entry.name.endsWith(extension))
    .map(entry => path.relative(CLIENT_DIR, path.join(entry.parentPath, entry.name)));

export const htmlFiles = (): string[] => filesWithExtension('.html');

export const jsFiles = (): string[] => filesWithExtension('.js');
