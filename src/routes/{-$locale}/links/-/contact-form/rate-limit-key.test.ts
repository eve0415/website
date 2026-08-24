import { describe, expect, it } from 'vitest';

import { rateLimitKey } from './rate-limit-key';

describe('IPv4', () => {
  it.each([
    ['1.2.3.4', 'v4:1.2.3.4'],
    ['0.0.0.0', 'v4:0.0.0.0'],
    ['255.255.255.255', 'v4:255.255.255.255'],
    ['203.0.113.5', 'v4:203.0.113.5'],
  ])('keys %s as %s', (ip, key) => {
    expect(rateLimitKey(ip)).toBe(key);
  });

  it('normalises leading zeroes, so a padded octet cannot buy a second budget', () => {
    expect(rateLimitKey('203.0.113.05')).toBe(rateLimitKey('203.0.113.5'));
  });

  it('does not accept an out-of-range octet as an address', () => {
    expect(rateLimitKey('999.1.1.1')).toBe('id:999.1.1.1');
  });
});

describe('IPv6', () => {
  it.each([
    ['2001:0db8:85a3:0000:8a2e:0370:7334:0001', 'v6:2001:0db8:85a3:0000'],
    ['2001:DB8:85A3:0:0:8A2E:370:7334', 'v6:2001:0db8:85a3:0000'],
    ['::', 'v6:0000:0000:0000:0000'],
    ['::1', 'v6:0000:0000:0000:0000'],
    ['2001:db8::', 'v6:2001:0db8:0000:0000'],
    ['2001:db8:1:2::1', 'v6:2001:0db8:0001:0002'],
    ['2001:db8:1:2:ffff::9', 'v6:2001:0db8:0001:0002'],
  ])('keys %s on its /64 as %s', (ip, key) => {
    expect(rateLimitKey(ip)).toBe(key);
  });

  it('gives two hosts in one /64 the same bucket', () => {
    expect(rateLimitKey('2001:db8:1:2::1')).toBe(rateLimitKey('2001:db8:1:2:ffff::9'));
  });

  it('gives two /64s their own buckets', () => {
    expect(rateLimitKey('2001:db8:1:2::1')).not.toBe(rateLimitKey('2001:db8:1:3::1'));
  });

  it('expands a trailing dotted quad in an address that is not v4-mapped', () => {
    expect(rateLimitKey('2001:db8::192.0.2.1')).toBe('v6:2001:0db8:0000:0000');
  });
});

describe('v4-mapped', () => {
  it.each([
    ['::ffff:192.0.2.1', 'v4:192.0.2.1'],
    ['::ffff:c000:0201', 'v4:192.0.2.1'],
    ['::ffff:0.0.0.0', 'v4:0.0.0.0'],
  ])('keys %s in the IPv4 space as %s, not on the shared ::ffff:0:0/96', (ip, key) => {
    expect(rateLimitKey(ip)).toBe(key);
  });

  it('keeps mapped addresses apart instead of collapsing them into one /64 bucket', () => {
    expect(rateLimitKey('::ffff:192.0.2.1')).not.toBe(rateLimitKey('::ffff:198.51.100.1'));
  });
});

describe('unparseable', () => {
  it.each([
    ['not-an-ip'],
    ['2001::db8::1'],
    ['1:2:3:4:5:6:7:8:9'],
    ['1:2:3:4::5:6:7:8'],
    ['2001:db8::192.0.2'],
    [''],
    // The sentinel `send-contact.ts` substitutes when the edge has not added
    // CF-Connecting-IP, so every local request shares one budget.
    ['unknown'],
  ])('falls through to its own key space for %o', ip => {
    expect(rateLimitKey(ip)).toBe(`id:${ip}`);
  });

  it('cannot reach an address key from the id space', () => {
    expect(rateLimitKey('v4:1.2.3.4')).toBe('id:v4:1.2.3.4');
  });
});
