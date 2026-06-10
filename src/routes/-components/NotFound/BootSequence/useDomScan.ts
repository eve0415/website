import { useEffect, useState } from 'react';

export interface DOMScanData {
  // Counts
  totalNodes: number;
  headElements: number;

  // Document info
  doctype: string;
  htmlLang: string;
  title: string;

  // Specific important elements
  stylesheets: StylesheetInfo[];
  meta: MetaInfo[];
  links: LinkInfo[];
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
  doctype: 'html',
  htmlLang: 'ja',
  title: '',
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
      const totalNodes = document.querySelectorAll('*').length;

      // Head count
      const headElements = document.head?.querySelectorAll('*').length ?? 0;

      // Document info
      const doctype = document.doctype?.name ?? 'html';
      const htmlLang = document.documentElement?.lang ?? 'en';
      const { title } = document;

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
        doctype,
        htmlLang,
        title,
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
