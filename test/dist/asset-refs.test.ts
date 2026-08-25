import { describe, expect, it } from 'vitest';

import { PAGES, exists, read } from './client-output';

/**
 * `vite build` never resolves a `/public` reference, and the prerender only
 * checks that pages render — so a renamed or deleted public file, or a typo
 * in a `href`/`src`, ships a broken page with a green build. Nothing else in
 * this project checks that what the HTML points at is actually there.
 *
 * Page links (`canonical`, the hreflang cluster) and the social meta tags are
 * the only absolute URLs this build ever emits; every asset reference is
 * root-relative. A leading "/" is therefore enough to tell "points at a file"
 * from "points at a page" without reading `rel` — confirmed against every
 * link in `dist/client`, not assumed.
 *
 * Artifact-only, and not splittable. Every `/assets/*` reference is
 * content-hashed at build time, so no source test can know the name. The
 * `public/` references — the favicons, the manifest link, the social cards —
 * are source-level strings, but they live inside `__root.tsx`'s `head()`, so
 * reaching them from node means importing the whole component tree to get at a
 * route option. The manifest's own icon list needs none of that and moved to
 * `test/source/manifest.test.ts`; the rest stays here.
 */
const ORIGIN = 'https://eve0415.net';

const isRootRelative = (url: string): boolean => url.startsWith('/');

const attributesOf = (tag: string): Map<string, string> =>
  new Map(
    [...tag.matchAll(/([A-Za-z][\w-]*)="([^"]*)"/gu)].map((match): [string, string] => {
      const [, name = '', value = ''] = match;

      return [name, value];
    }),
  );

const tagsIn = (html: string, name: string): Map<string, string>[] =>
  [...html.matchAll(new RegExp(String.raw`<${name}\b[^>]*>`, 'gu'))].map(([tag]) => attributesOf(tag));

/**
 * `srcset` is a comma-separated list of `url descriptor` pairs, not one URL —
 * split on the comma, then drop each candidate's width/density descriptor.
 */
const srcsetUrls = (srcset: string): string[] =>
  srcset
    .split(',')
    .map(candidate => candidate.trim().split(/\s+/u).at(0))
    .filter((url): url is string => url !== undefined && isRootRelative(url));

/** Strips the site origin from an absolute `og:image` / `twitter:image` URL. */
const pathOf = (url: string): string | undefined => (url.startsWith(ORIGIN) ? url.slice(ORIGIN.length) : undefined);

interface References {
  /** `<link href>` values that point at a file: icons, manifest, preload, stylesheets. */
  links: string[];
  /** `<script src>` values. */
  scripts: string[];
  /** `<img src>` values. */
  imgSrcs: string[];
  /** Every root-relative candidate across every `<img srcset>`. */
  srcsetUrls: string[];
  /** `og:image` / `twitter:image` meta `content`, with the origin stripped. */
  socialImages: string[];
}

/**
 * Every root-relative reference a page's markup makes, read fresh from disk
 * on every call. Not scoped to `<head>`: the hero and avatar images, and the
 * hydration `<script>`, are body content.
 *
 * Called from inside each `it` rather than once per `describe.each` body — a
 * page missing from `dist/` throws, and thrown during collection that takes
 * every test in this file out of the run silently rather than turning it red.
 */
const referencesOf = (file: string): References => {
  const html = read(file);
  const imgTags = tagsIn(html, 'img');

  return {
    links: tagsIn(html, 'link')
      .map(attrs => attrs.get('href'))
      .filter((href): href is string => href !== undefined && isRootRelative(href)),
    scripts: tagsIn(html, 'script')
      .map(attrs => attrs.get('src'))
      .filter((src): src is string => src !== undefined && isRootRelative(src)),
    imgSrcs: imgTags.map(attrs => attrs.get('src')).filter((src): src is string => src !== undefined && isRootRelative(src)),
    srcsetUrls: imgTags
      .map(attrs => attrs.get('srcSet'))
      .filter((value): value is string => value !== undefined)
      .flatMap(value => srcsetUrls(value)),
    // React renders the property as `og:image` / `twitter:image` on `property`
    // and `name` respectively; matched on the parsed attribute rather than a
    // tag-wide regex so `og:image:width` etc. can't be mistaken for the image.
    socialImages: tagsIn(html, 'meta')
      .filter(attrs => attrs.get('property') === 'og:image' || attrs.get('name') === 'twitter:image')
      .map(attrs => attrs.get('content'))
      .filter((content): content is string => content !== undefined)
      .map(content => pathOf(content))
      .filter((path): path is string => path !== undefined),
  };
};

describe.each(PAGES)('$file', page => {
  it('carries <link> file references that all exist under dist/client', () => {
    const missing = referencesOf(page.file).links.filter(href => !exists(href.slice(1)));

    expect(missing).toStrictEqual([]);
  });

  it('loads a <script src> that exists under dist/client', () => {
    const missing = referencesOf(page.file).scripts.filter(src => !exists(src.slice(1)));

    expect(missing).toStrictEqual([]);
  });

  it('renders <img> src and every srcset candidate that all exist under dist/client', () => {
    const refs = referencesOf(page.file);
    const missing = [...refs.imgSrcs, ...refs.srcsetUrls].filter(src => !exists(src.slice(1)));

    expect(missing).toStrictEqual([]);
  });

  it('advertises a social card image that exists under dist/client', () => {
    const missing = referencesOf(page.file).socialImages.filter(path => !exists(path.slice(1)));

    expect(missing).toStrictEqual([]);
  });
});
