import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

/** What `vite build` writes, and what Cloudflare's asset server answers from. */
const CLIENT_DIR = 'dist/client';

// Thrown at import time rather than skipped: a suite that reports zero tests
// when the build is missing would be the one failure these tests cannot see.
if (!existsSync(CLIENT_DIR)) {
  throw new Error(`${CLIENT_DIR} is missing. These tests assert over the built output — run \`pnpm build\` first.`);
}

// Re-exported rather than imported from `../pages` at each call site so that
// everything asserting over `dist/` — the `dist` project and both Playwright
// specs — picks up the import-time throw above by reaching for the page list.
export { PAGES } from '../pages';

export const exists = (file: string): boolean => existsSync(path.join(CLIENT_DIR, file));

export const read = (file: string): string => readFileSync(path.join(CLIENT_DIR, file), 'utf8');

/** Paths of every built file with this extension, relative to `dist/client`. */
const filesWithExtension = (extension: string): string[] =>
  readdirSync(CLIENT_DIR, { recursive: true, withFileTypes: true })
    .filter(entry => entry.isFile() && entry.name.endsWith(extension))
    .map(entry => path.relative(CLIENT_DIR, path.join(entry.parentPath, entry.name)));

export const htmlFiles = (): string[] => filesWithExtension('.html');

export const jsFiles = (): string[] => filesWithExtension('.js');
