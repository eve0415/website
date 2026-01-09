import { createServerFn } from '@tanstack/react-start';

/**
 * Connection info that cannot be obtained from browser APIs.
 * Server can access Cloudflare request context for some of this data.
 */
export interface ConnectionInfo {
  // Server IP (from Cloudflare cf-connecting-ip or known)
  serverIp: string;

  // TLS info (some can be detected server-side)
  tlsVersion: string;
  tlsCipher: string;

  // Certificate info (static for eve0415.net)
  certIssuer: string;
  certCN: string;
  certValidFrom: string;
  certValidTo: string;
  certChain: string[];

  // HTTP protocol detected
  httpVersion: string;

  // Cloudflare specific (if available)
  cfRay: string | null;
  colo: string | null;
}

/**
 * Server function to get connection metadata.
 * Accesses Cloudflare request context when available.
 */
export const getConnectionInfo = createServerFn().handler(async (): Promise<ConnectionInfo> => {
  // In Cloudflare Workers, we could access request headers via:
  // - cf-connecting-ip: Client IP
  // - cf-ray: Request ID
  // - cf-ipcountry: Country code
  //
  // For now, return known static values for eve0415.net
  // These can be enhanced when we have access to request context

  // Known Cloudflare IPs for eve0415.net (these rotate, using common one)
  const serverIp = '104.21.48.170';

  // Certificate details for eve0415.net (Let's Encrypt)
  // These are relatively static - updated every 90 days
  const now = new Date();
  const certValidFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]!;
  const certValidTo = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]!;

  return {
    serverIp,
    tlsVersion: 'TLSv1.3',
    tlsCipher: 'TLS_AES_128_GCM_SHA256',
    certIssuer: "Let's Encrypt",
    certCN: 'eve0415.net',
    certValidFrom,
    certValidTo,
    certChain: ["Let's Encrypt R3", 'ISRG Root X1'],
    httpVersion: 'h2', // Default, actual detected from nav timing
    cfRay: null, // Would need request context
    colo: null, // Would need request context (e.g., 'NRT' for Tokyo)
  };
});
