import { useEffect, useState } from 'react';

export interface DOMElementInfo {
  tagName: string;
  count: number;
  examples: string[]; // First few examples with attributes
}

export interface DOMScanData {
  // Counts
  totalNodes: number;
  headElements: number;
  bodyElements: number;

  // Document info
  doctype: string;
  htmlLang: string;
  title: string;

  // Detailed element breakdown
  elements: DOMElementInfo[];

  // Specific important elements
  scripts: ScriptInfo[];
  stylesheets: StylesheetInfo[];
  meta: MetaInfo[];
  links: LinkInfo[];
}

export interface ScriptInfo {
  src: string | null;
  type: string;
  async: boolean;
  defer: boolean;
  isInline: boolean;
}

export interface StylesheetInfo {
  href: string | null;
  media: string;
  isInline: boolean;
}

export interface MetaInfo {
  name: string | null;
  property: string | null;
  content: string;
  charset: string | null;
}

export interface LinkInfo {
  rel: string;
  href: string;
  type: string | null;
}

const DEFAULT_DATA: DOMScanData = {
  totalNodes: 0,
  headElements: 0,
  bodyElements: 0,
  doctype: 'html',
  htmlLang: 'ja',
  title: '',
  elements: [],
  scripts: [],
  stylesheets: [],
  meta: [],
  links: [],
};

/**
 * Hook to scan the current DOM and return structured information.
 * Used to show real HTML parsing output in boot sequence.
 */
export const useDOMScan = (): DOMScanData => {
  const [data, setData] = useState<DOMScanData>(DEFAULT_DATA);

  useEffect(() => {
    if (document === undefined) return;

    const scanDOM = (): DOMScanData => {
      // Total node count
      const allNodes = document.querySelectorAll('*');
      const totalNodes = allNodes.length;

      // Head/body counts
      const headElements = document.head?.querySelectorAll('*').length ?? 0;
      const bodyElements = document.body?.querySelectorAll('*').length ?? 0;

      // Document info
      const doctype = document.doctype?.name ?? 'html';
      const htmlLang = document.documentElement?.lang ?? 'en';
      const { title } = document;

      // Count elements by tag
      const tagCounts = new Map<string, { count: number; examples: string[] }>();

      for (const el of allNodes) {
        const tag = el.tagName.toLowerCase();
        const existing = tagCounts.get(tag) ?? { count: 0, examples: [] };
        existing.count++;

        // Store up to 2 examples per tag
        if (existing.examples.length < 2) {
          const example = formatElementExample(el);
          if (example) existing.examples.push(example);
        }

        tagCounts.set(tag, existing);
      }

      const elements: DOMElementInfo[] = Array.from(tagCounts.entries())
        .map(([tagName, { count, examples }]) => ({ tagName, count, examples }))
        .toSorted((a, b) => b.count - a.count)
        .slice(0, 15); // Top 15 tags

      // Scripts
      const scriptElements = document.querySelectorAll('script');
      const scripts: ScriptInfo[] = Array.from(scriptElements).map(el => ({
        src: el.src || null,
        type: el.type || 'text/javascript',
        async: el.async,
        defer: el.defer,
        isInline: !el.src && el.textContent !== '',
      }));

      // Stylesheets
      const linkStylesheets = document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]');
      const styleElements = document.querySelectorAll('style');

      const stylesheets: StylesheetInfo[] = [
        ...Array.from(linkStylesheets).map(link => ({ href: link.href || null, media: link.media || 'all', isInline: false })),
        ...Array.from(styleElements).map(() => ({
          href: null,
          media: 'all',
          isInline: true,
        })),
      ];

      // Meta tags
      const metaElements = document.querySelectorAll('meta');
      const meta: MetaInfo[] = Array.from(metaElements).map(el => ({
        name: el.name || null,
        property: el.getAttribute('property') ?? null,
        content: el.content || '',
        charset: el.getAttribute('charset') ?? null,
      }));

      // Link elements (non-stylesheet)
      const linkElements = document.querySelectorAll<HTMLLinkElement>('link:not([rel="stylesheet"])');
      const links: LinkInfo[] = Array.from(linkElements).map(link => ({ rel: link.rel, href: link.href, type: link.getAttribute('type') }));

      return {
        totalNodes,
        headElements,
        bodyElements,
        doctype,
        htmlLang,
        title,
        elements,
        scripts,
        stylesheets,
        meta,
        links,
      };
    };

    // Delay scan slightly to ensure DOM is fully rendered
    const timer = setTimeout(() => {
      setData(scanDOM());
    }, 50);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return data;
};

/**
 * Format an element as a concise string for display
 */
const formatElementExample = (el: Element): string | null => {
  const tag = el.tagName.toLowerCase();
  const attrs: string[] = [];

  // Priority attributes to show
  const priorityAttrs = ['id', 'class', 'src', 'href', 'rel', 'name', 'type', 'content'];

  for (const attr of priorityAttrs) {
    const value = el.getAttribute(attr);
    if (value) {
      // Truncate long values
      const truncated = value.length > 30 ? `${value.slice(0, 30)}...` : value;
      attrs.push(`${attr}="${truncated}"`);
      if (attrs.length >= 2) break; // Max 2 attrs
    }
  }

  if (attrs.length === 0) return null;

  return `<${tag} ${attrs.join(' ')}>`;
};

/**
 * Format element count for display
 */
export const formatElementCount = (tagName: string, count: number): string => {
  if (count === 1) return `<${tagName}>`;
  return `<${tagName}> x ${count}`;
};
