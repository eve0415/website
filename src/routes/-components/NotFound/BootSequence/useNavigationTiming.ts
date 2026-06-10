import { useEffect, useState } from 'react';

export interface NavigationTimingData {
  // Timing milestones (ms)
  dns: number; // domainLookupEnd - domainLookupStart
  tls: number; // connectEnd - secureConnectionStart
  ttfb: number; // responseStart - requestStart
  total: number; // responseEnd - startTime

  // Sizes (bytes)
  transferSize: number; // Compressed size over network

  // Protocol info
  protocol: string; // 'h2', 'h3', 'http/1.1'

  // Resource entries
  resources: ResourceTimingEntry[];
}

export interface ResourceTimingEntry {
  name: string; // URL
  initiatorType: string; // 'script', 'link', 'css', etc.
  transferSize: number;
  decodedBodySize: number;
  duration: number;
  protocol: string;
}

const DEFAULT_DATA: NavigationTimingData = {
  dns: 0,
  tls: 0,
  ttfb: 0,
  total: 0,
  transferSize: 0,
  protocol: 'loading...',
  resources: [],
};

/**
 * Hook to get real navigation timing data from the browser's Performance API.
 * Returns actual DNS, TLS, TTFB, transfer sizes, and protocol information.
 */
export const useNavigationTiming = (): NavigationTimingData => {
  const [data, setData] = useState<NavigationTimingData>(DEFAULT_DATA);

  useEffect(() => {
    // Only runs on client
    if (globalThis.window === undefined || globalThis.performance === undefined) return;

    const isNavigationTiming = (entry: PerformanceEntry): entry is PerformanceNavigationTiming => entry.entryType === 'navigation' && 'responseEnd' in entry;

    const isResourceTiming = (entry: PerformanceEntry): entry is PerformanceResourceTiming => entry.entryType === 'resource' && 'transferSize' in entry;

    const getTimingData = () => {
      const entries = performance.getEntriesByType('navigation');
      const nav = entries.find(entry => isNavigationTiming(entry));

      if (!nav) return DEFAULT_DATA;

      // Get resource timing entries (same-origin only have full data)
      const resourceEntries = performance.getEntriesByType('resource').filter(entry => isResourceTiming(entry));
      const resources: ResourceTimingEntry[] = resourceEntries
        .filter(r => r.transferSize > 0) // Filter out cached/0-byte
        .map(r => ({
          name: r.name,
          initiatorType: r.initiatorType,
          transferSize: r.transferSize,
          decodedBodySize: r.decodedBodySize,
          duration: r.duration,
          protocol: r.nextHopProtocol || 'unknown',
        }))
        .slice(0, 20); // Limit to first 20

      return {
        dns: Math.round(nav.domainLookupEnd - nav.domainLookupStart),
        tls: nav.secureConnectionStart > 0 ? Math.round(nav.connectEnd - nav.secureConnectionStart) : 0,
        ttfb: Math.round(nav.responseStart - nav.requestStart),
        total: Math.round(nav.responseEnd - nav.startTime),
        transferSize: nav.transferSize,
        protocol: nav.nextHopProtocol || 'h2',
        resources,
      };
    };

    // Get data after a small delay to ensure metrics are available
    const timer = setTimeout(() => {
      setData(getTimingData());
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return data;
};
