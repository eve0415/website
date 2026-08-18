/**
 * Turns a client address into the key the contact form's KV counter is bucketed
 * by. Lives beside `send-contact.ts` because that is its only caller.
 *
 * The whole point is the IPv6 case. A routed /64 is the normal allocation for a
 * VPS or a home connection, so a sender who keys off the full /128 gets a fresh
 * counter for every request they make and the hourly cap never engages. Bucketing
 * on the /64 — the smallest block a single subscriber is handed — is what makes
 * the cap mean anything, and it is also the smallest block that cannot punish an
 * unrelated customer.
 *
 * The three key spaces are prefixed so they can never meet: `v4:1.2.3.4` is not
 * reachable by any IPv6 prefix, and an address that parses as neither lands in
 * `id:` rather than being mistaken for one.
 */

const DOTTED_QUAD = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
const HEXTET = /^[0-9a-fA-F]{1,4}$/;

const HEXTETS_IN_ADDRESS = 8;
const HEXTETS_IN_PREFIX = 4;
const HEXTET_MAX = 0xff_ff;
const OCTET_MAX = 0xff;

/** The /96 that IPv4 addresses are embedded in as `::ffff:a.b.c.d`. */
const V4_MAPPED_HEXTETS = [0, 0, 0, 0, 0, HEXTET_MAX] as const;

const parseIpv4 = (value: string): readonly number[] | undefined => {
  if (!DOTTED_QUAD.test(value)) return undefined;

  const octets = value.split('.').map(Number);
  return octets.every(octet => Number.isInteger(octet) && octet >= 0 && octet <= OCTET_MAX) ? octets : undefined;
};

/**
 * One side of the `::`, left to right. A trailing dotted quad is legal in the
 * last position only — `::ffff:192.0.2.1` and `2001:db8::192.0.2.1` both arrive
 * in the wild — and expands to the two hextets it encodes.
 */
const parseHextets = (side: string): readonly number[] | undefined => {
  if (side === '') return [];

  const parts = side.split(':');
  const hextets: number[] = [];

  for (const [index, part] of parts.entries()) {
    if (index === parts.length - 1 && part.includes('.')) {
      const octets = parseIpv4(part);
      if (octets === undefined) return undefined;

      const [a, b, c, d] = octets;
      if (a === undefined || b === undefined || c === undefined || d === undefined) return undefined;

      hextets.push(a * 256 + b, c * 256 + d);
      continue;
    }

    if (!HEXTET.test(part)) return undefined;
    hextets.push(Number.parseInt(part, 16));
  }

  return hextets;
};

/** Expands the `::` run of zeroes so the result is always eight hextets. */
const parseIpv6 = (value: string): readonly number[] | undefined => {
  // At most one `::` per address, so anything past the second half is malformed.
  const [head, tail, ...rest] = value.split('::');
  if (head === undefined || rest.length > 0) return undefined;

  if (tail === undefined) {
    const only = parseHextets(head);
    return only?.length === HEXTETS_IN_ADDRESS ? only : undefined;
  }

  const left = parseHextets(head);
  const right = parseHextets(tail);
  if (left === undefined || right === undefined) return undefined;

  // `::` stands for at least one hextet, so a full eight either side is invalid.
  const elided = HEXTETS_IN_ADDRESS - left.length - right.length;
  if (elided < 1) return undefined;

  return [...left, ...Array.from({ length: elided }, () => 0), ...right];
};

const isV4Mapped = (hextets: readonly number[]): boolean => V4_MAPPED_HEXTETS.every((expected, index) => hextets[index] === expected);

const toV4Key = (octets: readonly number[]): string => `v4:${octets.join('.')}`;

export const rateLimitKey = (ip: string): string => {
  const octets = parseIpv4(ip);
  // Rebuilt from the parsed octets rather than echoed, so `203.0.113.05` cannot
  // buy a second budget alongside `203.0.113.5`.
  if (octets !== undefined) return toV4Key(octets);

  const hextets = parseIpv6(ip);
  if (hextets === undefined) return `id:${ip}`;

  // An IPv4 address wearing an IPv6 costume is still one address, and its /64
  // would otherwise collapse every mapped address in the world into one bucket.
  if (isV4Mapped(hextets)) {
    return toV4Key(hextets.slice(V4_MAPPED_HEXTETS.length).flatMap(hextet => [Math.floor(hextet / 256), hextet % 256]));
  }

  return `v6:${hextets
    .slice(0, HEXTETS_IN_PREFIX)
    .map(hextet => hextet.toString(16).padStart(4, '0'))
    .join(':')}`;
};
