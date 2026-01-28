import { createServerFn, createServerOnlyFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';
import Cloudflare from 'cloudflare';
import { env, waitUntil } from 'cloudflare:workers';

/**
 * Certificate info from Cloudflare API.
 * SDK types are incomplete (list/get return `unknown`), so we define our own.
 */
export interface Certificate {
  id?: string;
  hosts?: string[];
  issuer?: string;
  signature?: string;
  uploaded_on?: string;
  expires_on?: string;
  bundle_method?: string;
}

/**
 * Certificate pack from Cloudflare SSL API.
 * Based on actual API response structure (SDK lacks proper typing for list responses).
 */
export interface CertificatePack {
  id?: string;
  type?: string;
  hosts?: string[];
  status?: string;
  certificates?: Certificate[];
  certificate_authority?: string;
  validation_method?: string;
  validity_days?: number;
}

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

  // HTTP protocol detected
  httpVersion: string;

  // Cloudflare specific
  cfRay: string | null;
  colo: string | null;

  // Certificate pack from Cloudflare API (full SDK type)
  certificatePack: CertificatePack | null;
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const isStringArray = (value: unknown): value is string[] => Array.isArray(value) && value.every(item => typeof item === 'string');

const isCertificatePack = (value: unknown): value is CertificatePack => {
  if (!isRecord(value)) return false;
  const { hosts } = value;
  if (hosts !== undefined && !isStringArray(hosts)) return false;
  const { certificates } = value;
  if (certificates !== undefined && !Array.isArray(certificates)) return false;
  return true;
};

// KV cache key for certificate data
const CERT_CACHE_KEY = 'cert-data-eve0415';

/**
 * Fetch certificate pack from Cloudflare API using SDK.
 * Uses async iteration to paginate until the matching pack is found.
 * @internal Exported for testing purposes only
 */
const fetchCertFromCloudflareAPI = createServerOnlyFn(async (): Promise<CertificatePack | null> => {
  const token = env.CLOUDFLARE_API_TOKEN;
  const zoneId = env.CLOUDFLARE_ZONE_ID;

  // No fallback - let errors propagate if secrets missing
  const client = new Cloudflare({ apiToken: token });

  // Use SDK async iterator - paginate until found
  for await (const rawPack of client.ssl.certificatePacks.list({ zone_id: zoneId })) {
    if (!isCertificatePack(rawPack)) continue;
    const pack = rawPack;
    const hosts = pack.hosts ?? [];
    if (hosts.some(h => h === 'eve0415.net' || h === '*.eve0415.net')) return pack;
  }

  return null;
});

/**
 * Get certificate pack with KV caching.
 * Uses waitUntil for non-blocking cache writes.
 * Strict: propagates errors if cache expired and API fails.
 * @internal Exported for testing purposes only
 */
const getCachedCert = createServerOnlyFn(async (): Promise<CertificatePack | null> => {
  const kv = env.CACHE;
  const cached = await kv.get<CertificatePack>(CERT_CACHE_KEY, 'json');

  if (cached) {
    // Check validity using SDK type's expires_on field
    const expiresOn = cached.certificates?.[0]?.expires_on;
    if (expiresOn && new Date(expiresOn) > new Date()) return cached;
  }

  // Strict: propagate errors, no fallback for stale cache
  const fresh = await fetchCertFromCloudflareAPI();

  if (fresh) {
    const expiresOn = fresh.certificates?.[0]?.expires_on;
    const ttl = expiresOn ? Math.max(3600, Math.min(Math.floor((new Date(expiresOn).getTime() - Date.now()) / 1000), 604800)) : 86400;

    // Write to cache without blocking the response
    waitUntil(kv.put(CERT_CACHE_KEY, JSON.stringify(fresh), { expirationTtl: ttl }));
  }

  return fresh;
});

/**
 * Server function to get connection metadata.
 * Reads real data from Cloudflare request headers and API.
 */
export const getConnectionInfo = createServerFn().handler(async (): Promise<ConnectionInfo> => {
  const headers: unknown = getRequestHeaders();
  const headerMap = headers instanceof Headers ? headers : new Headers();
  const certificatePack = await getCachedCert();

  return {
    // Cloudflare edge IP (static - could be enhanced with DNS lookup)
    serverIp: '104.21.48.170',

    // Real TLS info from injected headers (set in server.ts)
    tlsVersion: headerMap.get('X-CF-TLS-Version') ?? 'TLSv1.3',
    tlsCipher: headerMap.get('X-CF-TLS-Cipher') ?? 'unknown',

    // Real HTTP protocol from injected header
    httpVersion: headerMap.get('X-CF-HTTP-Protocol') ?? 'loading...',

    // Real Cloudflare metadata
    cfRay: headerMap.get('CF-Ray'),
    colo: headerMap.get('X-CF-Colo'),

    // Full certificate pack from Cloudflare API
    certificatePack,
  };
});
