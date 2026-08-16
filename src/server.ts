/**
 * The server entry exists only so the Worker has somewhere to export a Durable
 * Object class from: Cloudflare resolves `class_name` against the deployed
 * script's exports, and the package's own entry naturally has no export for the
 * contact form's rate limiter. `resolveEntry` picks `src/server.ts` up by name
 * and it replaces `@tanstack/react-start/server-entry` as the entry, so the
 * package default is re-exported here unchanged rather than rebuilt.
 */
export { ContactRateLimiter } from '#routes/{-$locale}/links/-/contact-form/rate-limiter';

export { default } from '@tanstack/react-start/server-entry';
