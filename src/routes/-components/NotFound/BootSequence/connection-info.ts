import { createServerFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { env, waitUntil } from 'cloudflare:workers';

/**
 * Connection info that cannot be obtained from browser APIs.
 * Server accesses Cloudflare request context and API for real data.
 */
export interface ConnectionInfo {
  // Server IP (Cloudflare edge IP)
  serverIp: string;

  // TLS info from Cloudflare request context
  tlsVersion: string;
  tlsCipher: string;

  // Certificate info (from Cloudflare API)
  certIssuer: string;
  certCN: string;
  certValidFrom: string;
  certValidTo: string;
  certChain: string[];

  // HTTP protocol detected
  httpVersion: string;

  // Cloudflare specific
  cfRay: string | null;
  colo: string | null;
}

// KV cache key for certificate data
const CERT_CACHE_KEY = 'cert-data-eve0415';

interface CertificateData {
  issuer: string;
  cn: string;
  validFrom: string;
  validTo: string;
  chain: string[];
}

// Fallback certificate data when API is unavailable
const FALLBACK_CERT: CertificateData = {
  issuer: 'Cloudflare',
  cn: 'eve0415.net',
  validFrom: 'unknown',
  validTo: 'unknown',
  chain: [],
};

/**
 * Fetch certificate data from Cloudflare API.
 * Requires CLOUDFLARE_API_TOKEN and CLOUDFLARE_ZONE_ID secrets.
 */
async function fetchCertFromCloudflareAPI(): Promise<CertificateData | null> {
  const token = env.CLOUDFLARE_API_TOKEN;
  const zoneId = env.CLOUDFLARE_ZONE_ID;

  if (!token || !zoneId) {
    return null;
  }

  try {
    const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/ssl/certificate_packs`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      console.error(`Cloudflare API error: ${response.status}`);
      return null;
    }

    const data = (await response.json()) as {
      success: boolean;
      result?: Array<{
        primary_certificate?: string;
        certificates?: Array<{
          issuer?: string;
          hosts?: string[];
          uploaded_on?: string;
          expires_on?: string;
        }>;
      }>;
    };

    if (!data.success || !data.result?.length) {
      return null;
    }

    // Find the active certificate pack for eve0415.net
    const pack = data.result.find(p => p.certificates?.some(c => c.hosts?.includes('eve0415.net') || c.hosts?.includes('*.eve0415.net')));

    if (!pack?.certificates?.length) {
      return null;
    }

    const primaryCert = pack.certificates[0];
    const chain = pack.certificates.slice(1).map(c => c.issuer ?? 'Unknown');

    return {
      issuer: primaryCert?.issuer ?? 'Cloudflare',
      cn: 'eve0415.net',
      validFrom: primaryCert?.uploaded_on?.split('T')[0] ?? 'unknown',
      validTo: primaryCert?.expires_on?.split('T')[0] ?? 'unknown',
      chain,
    };
  } catch (error) {
    console.error('Failed to fetch certificate from Cloudflare API:', error);
    return null;
  }
}

/**
 * Get certificate data with KV caching.
 * Uses waitUntil for non-blocking cache writes.
 */
async function getCachedCert(): Promise<CertificateData> {
  const kv = env.CACHE;

  // Try to get from cache
  const cached = await kv.get<CertificateData>(CERT_CACHE_KEY, 'json');

  if (cached) {
    // Check if still valid (has expiry date and not expired)
    if (cached.validTo !== 'unknown') {
      const expiry = new Date(cached.validTo);
      if (expiry > new Date()) {
        return cached;
      }
    } else {
      // No expiry info but has data - use it
      return cached;
    }
  }

  // Cache miss or expired - fetch fresh data
  const fresh = await fetchCertFromCloudflareAPI();

  if (fresh) {
    // Calculate TTL based on certificate expiry
    let ttl = 86400; // Default 24 hours
    if (fresh.validTo !== 'unknown') {
      const expiry = new Date(fresh.validTo);
      const secondsUntilExpiry = Math.floor((expiry.getTime() - Date.now()) / 1000);
      // Use expiry-based TTL, but cap at 7 days and minimum 1 hour
      ttl = Math.max(3600, Math.min(secondsUntilExpiry, 604800));
    }

    // Write to cache without blocking the response
    waitUntil(kv.put(CERT_CACHE_KEY, JSON.stringify(fresh), { expirationTtl: ttl }));

    return fresh;
  }

  return FALLBACK_CERT;
}

/**
 * Server function to get connection metadata.
 * Reads real data from Cloudflare request headers and API.
 */
export const getConnectionInfo = createServerFn().handler(async (): Promise<ConnectionInfo> => {
  const headers = getRequestHeaders();
  const cert = await getCachedCert();

  return {
    // Cloudflare edge IP (static - could be enhanced with DNS lookup)
    serverIp: '104.21.48.170',

    // Real TLS info from injected headers (set in server.ts)
    tlsVersion: headers.get('X-CF-TLS-Version') ?? 'TLSv1.3',
    tlsCipher: headers.get('X-CF-TLS-Cipher') ?? 'unknown',

    // Real certificate data from Cloudflare API
    certIssuer: cert.issuer,
    certCN: cert.cn,
    certValidFrom: cert.validFrom,
    certValidTo: cert.validTo,
    certChain: cert.chain,

    // Real HTTP protocol from injected header
    httpVersion: headers.get('X-CF-HTTP-Protocol') ?? 'loading...',

    // Real Cloudflare metadata
    cfRay: headers.get('CF-Ray'),
    colo: headers.get('X-CF-Colo'),
  };
});
