/**
 * `subset-font` ships no types. Declared here rather than suppressed, and
 * narrowed to the one call `subsetFonts` in vite.config.ts makes: the package's
 * own options also cover `sfnt`/`truetype` targets and variation-axis pinning,
 * none of which this build asks for.
 *
 * Signature read off the package's README and index.js for 2.5.0 — a version
 * bump that changes it is a compile error here, which is the point.
 */
declare module 'subset-font' {
  interface SubsetFontOptions {
    targetFormat?: 'woff' | 'woff2' | 'sfnt' | 'truetype';
  }

  /** Resolves to the subset font, in `targetFormat`, holding only `text`'s glyphs. */
  export default function subsetFont(font: Buffer, text: string, options?: SubsetFontOptions): Promise<Buffer>;
}
