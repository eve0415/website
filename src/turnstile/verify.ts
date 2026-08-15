import { env } from 'cloudflare:workers';

import { TURNSTILE_ACTION } from '#turnstile/constants';

const SITEVERIFY_ENDPOINT = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

interface SiteverifyOutcome {
  success: boolean;
  action: string | undefined;
  hostname: string | undefined;
}

const readOutcome = (payload: unknown): SiteverifyOutcome | undefined => {
  if (typeof payload !== 'object' || payload === null) return undefined;
  if (!('success' in payload) || typeof payload.success !== 'boolean') return undefined;

  return {
    success: payload.success,
    action: 'action' in payload && typeof payload.action === 'string' ? payload.action : undefined,
    hostname: 'hostname' in payload && typeof payload.hostname === 'string' ? payload.hostname : undefined,
  };
};

/**
 * Exchanges a widget token for a verdict.
 *
 * `expectedHostname` is the host of the request being protected, not a fixed
 * allowlist — an allowlist rejects preview deployments, whose hostnames are not
 * known ahead of time, while this still refuses a token minted for another site.
 *
 * Tokens are single-use and expire after 300s; the widget has to be reset
 * before a second submission.
 */
export const verifyTurnstileToken = async (token: string, expectedHostname: string, remoteIp: string | undefined): Promise<boolean> => {
  const form = new FormData();
  form.append('secret', env.TURNSTILE_SECRET_KEY);
  form.append('response', token);
  if (remoteIp !== undefined) form.append('remoteip', remoteIp);

  const response = await fetch(SITEVERIFY_ENDPOINT, { method: 'POST', body: form });
  if (!response.ok) return false;

  const payload: unknown = await response.json();
  const outcome = readOutcome(payload);
  if (outcome === undefined) return false;

  return outcome.success && outcome.action === TURNSTILE_ACTION && outcome.hostname === expectedHostname;
};
