import { useEffect, useState } from 'react';

export interface NavigationTimingData {
  // Timing milestones (ms)
  dns: number; // domainLookupEnd - domainLookupStart
  tcp: number; // connectEnd - connectStart (excluding TLS)
  tls: number; // connectEnd - secureConnectionStart
  ttfb: number; // responseStart - requestStart
  download: number; // responseEnd - responseStart
  total: number; // responseEnd - startTime

  // Sizes (bytes)
  transferSize: number; // Compressed size over network
  encodedBodySize: number; // Response body compressed
  decodedBodySize: number; // Response body uncompressed

  // Protocol info
  protocol: string; // 'h2', 'h3', 'http/1.1'

  // Resource entries
  resources: ResourceTimingEntry[];

  // Raw entry for debugging
  raw: PerformanceNavigationTiming | null;
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
  tcp: 0,
  tls: 0,
  ttfb: 0,
  download: 0,
  total: 0,
  transferSize: 0,
  encodedBodySize: 0,
  decodedBodySize: 0,
  protocol: 'h2',
  resources: [],
  raw: null,
};

/**
 * Hook to get real navigation timing data from the browser's Performance API.
 * Returns actual DNS, TLS, TTFB, transfer sizes, and protocol information.
 */
export const useNavigationTiming = (): NavigationTimingData => {
  const [data, setData] = useState<NavigationTimingData>(DEFAULT_DATA);

  useEffect(() => {
    // Only runs on client
    if (typeof window === 'undefined' || !window.performance) {
      return;
    }

    const getTimingData = () => {
      const entries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      const nav = entries[0];

      if (!nav) {
        return DEFAULT_DATA;
      }

      // Get resource timing entries (same-origin only have full data)
      const resourceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
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
        tcp: Math.round(nav.connectEnd - nav.connectStart),
        tls: nav.secureConnectionStart > 0 ? Math.round(nav.connectEnd - nav.secureConnectionStart) : 0,
        ttfb: Math.round(nav.responseStart - nav.requestStart),
        download: Math.round(nav.responseEnd - nav.responseStart),
        total: Math.round(nav.responseEnd - nav.startTime),
        transferSize: nav.transferSize,
        encodedBodySize: nav.encodedBodySize,
        decodedBodySize: nav.decodedBodySize,
        protocol: nav.nextHopProtocol || 'h2',
        resources,
        raw: nav,
      };
    };

    // Get data after a small delay to ensure metrics are available
    const timer = setTimeout(() => {
      setData(getTimingData());
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return data;
};

/**
 * Format bytes to human-readable string
 */
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/**
 * Get protocol display name
 */
export const getProtocolDisplay = (protocol: string): string => {
  switch (protocol) {
    case 'h3':
      return 'HTTP/3';
    case 'h2':
      return 'HTTP/2';
    case 'http/1.1':
      return 'HTTP/1.1';
    default:
      return protocol.toUpperCase();
  }
};
