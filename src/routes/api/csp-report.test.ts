import { describe, expect, test } from 'vitest';

// Get reference to the actual handlers from the route
import { Route } from './csp-report';

// Extract the POST handler from the route config
const getPostHandler = () => {
  const routeOptions = Route.options as { server?: { handlers?: { POST?: (ctx: { request: Request }) => Promise<Response> } } };
  return routeOptions.server?.handlers?.POST;
};

describe('/api/csp-report POST handler', () => {
  // Note: Console logging verification is not possible in Workers pool tests
  // as console methods run in isolated Workers context. We verify behavior via response codes.

  describe('report-uri format', () => {
    test('accepts valid report-uri format and returns 204', async () => {
      const handler = getPostHandler();
      expect(handler).toBeDefined();

      const report = {
        'csp-report': {
          'document-uri': 'https://example.com/page',
          'violated-directive': 'script-src',
          'effective-directive': 'script-src',
          'original-policy': "default-src 'self'",
          'blocked-uri': 'inline',
          'status-code': 200,
        },
      };

      const request = new Request('http://localhost/api/csp-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/csp-report' },
        body: JSON.stringify(report),
      });

      const response = await handler!({ request });

      expect(response.status).toBe(204);
    });

    test('accepts report-uri format with all optional fields', async () => {
      const handler = getPostHandler();

      const report = {
        'csp-report': {
          'document-uri': 'https://example.com/page',
          'violated-directive': 'script-src',
          'effective-directive': 'script-src',
          'original-policy': "default-src 'self'",
          'blocked-uri': 'https://evil.com/script.js',
          'status-code': 200,
          'source-file': 'https://example.com/page.html',
          'line-number': 42,
          'column-number': 10,
        },
      };

      const request = new Request('http://localhost/api/csp-report', {
        method: 'POST',
        body: JSON.stringify(report),
      });

      const response = await handler!({ request });

      expect(response.status).toBe(204);
    });

    test('handles report-uri format with missing optional fields', async () => {
      const handler = getPostHandler();

      const report = {
        'csp-report': {
          'document-uri': 'https://example.com',
          'violated-directive': 'script-src',
          'effective-directive': 'script-src',
          'original-policy': "default-src 'self'",
          'blocked-uri': 'inline',
          'status-code': 200,
          // source-file, line-number, column-number omitted
        },
      };

      const request = new Request('http://localhost/api/csp-report', {
        method: 'POST',
        body: JSON.stringify(report),
      });

      const response = await handler!({ request });

      expect(response.status).toBe(204);
    });
  });

  describe('Reporting API format', () => {
    test('accepts valid Reporting API format and returns 204', async () => {
      const handler = getPostHandler();

      const report = [
        {
          type: 'csp-violation',
          age: 10,
          url: 'https://example.com/page',
          user_agent: 'Mozilla/5.0',
          body: {
            documentURL: 'https://example.com/page',
            blockedURL: 'inline',
            effectiveDirective: 'script-src',
            originalPolicy: "default-src 'self'",
          },
        },
      ];

      const request = new Request('http://localhost/api/csp-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/reports+json' },
        body: JSON.stringify(report),
      });

      const response = await handler!({ request });

      expect(response.status).toBe(204);
    });

    test('accepts Reporting API format with all fields', async () => {
      const handler = getPostHandler();

      const report = [
        {
          type: 'csp-violation',
          age: 10,
          url: 'https://example.com/page',
          user_agent: 'Mozilla/5.0',
          body: {
            documentURL: 'https://example.com/page',
            blockedURL: 'https://evil.com/script.js',
            effectiveDirective: 'script-src',
            originalPolicy: "default-src 'self'",
            sourceFile: 'https://example.com/page.html',
            lineNumber: 99,
          },
        },
      ];

      const request = new Request('http://localhost/api/csp-report', {
        method: 'POST',
        body: JSON.stringify(report),
      });

      const response = await handler!({ request });

      expect(response.status).toBe(204);
    });

    test('handles multiple reports in Reporting API format', async () => {
      const handler = getPostHandler();

      const report = [
        {
          type: 'csp-violation',
          age: 10,
          url: 'https://example.com/page',
          user_agent: 'Mozilla/5.0',
          body: {
            documentURL: 'https://example.com/page',
            blockedURL: 'inline',
            effectiveDirective: 'script-src',
          },
        },
        {
          type: 'csp-violation',
          age: 20,
          url: 'https://example.com/page2',
          user_agent: 'Mozilla/5.0',
          body: {
            documentURL: 'https://example.com/page2',
            blockedURL: 'https://cdn.example.com/style.css',
            effectiveDirective: 'style-src',
          },
        },
      ];

      const request = new Request('http://localhost/api/csp-report', {
        method: 'POST',
        body: JSON.stringify(report),
      });

      const response = await handler!({ request });

      expect(response.status).toBe(204);
    });

    test('handles Reporting API with non-csp-violation type', async () => {
      const handler = getPostHandler();

      const report = [
        {
          type: 'deprecation',
          age: 10,
          url: 'https://example.com',
          user_agent: 'Mozilla/5.0',
          body: {
            id: 'feature-xyz',
            message: 'Feature xyz is deprecated',
          },
        },
      ];

      const request = new Request('http://localhost/api/csp-report', {
        method: 'POST',
        body: JSON.stringify(report),
      });

      const response = await handler!({ request });

      // Should still return 204 (non-csp-violation types are ignored but accepted)
      expect(response.status).toBe(204);
    });
  });

  describe('error handling', () => {
    test('returns 413 for oversized request body', async () => {
      const handler = getPostHandler();

      const request = new Request('http://localhost/api/csp-report', {
        method: 'POST',
        headers: { 'Content-Length': '5000' }, // Exceeds MAX_BODY_SIZE (4096)
        body: JSON.stringify({ 'csp-report': {} }),
      });

      const response = await handler!({ request });

      expect(response.status).toBe(413);
      const text = await response.text();
      expect(text).toBe('Request body too large');
    });

    test('returns 400 for invalid JSON', async () => {
      const handler = getPostHandler();

      const request = new Request('http://localhost/api/csp-report', {
        method: 'POST',
        body: 'not valid json {{{',
      });

      const response = await handler!({ request });

      expect(response.status).toBe(400);
      const text = await response.text();
      expect(text).toBe('Invalid JSON');
    });

    test('returns 400 for malformed report structure', async () => {
      const handler = getPostHandler();

      const request = new Request('http://localhost/api/csp-report', {
        method: 'POST',
        body: JSON.stringify({ unexpected: 'format' }),
      });

      const response = await handler!({ request });

      expect(response.status).toBe(400);
      const text = await response.text();
      expect(text).toBe('Invalid report format');
    });

    test('returns 400 for empty array', async () => {
      const handler = getPostHandler();

      const request = new Request('http://localhost/api/csp-report', {
        method: 'POST',
        body: JSON.stringify([]),
      });

      const response = await handler!({ request });

      expect(response.status).toBe(400);
      const text = await response.text();
      expect(text).toBe('Invalid report format');
    });

    test('returns 400 for primitive JSON values', async () => {
      const handler = getPostHandler();

      // Primitive values like number, string, boolean are not valid CSP reports
      const request = new Request('http://localhost/api/csp-report', {
        method: 'POST',
        body: '42',
      });

      const response = await handler!({ request });

      expect(response.status).toBe(400);
      const text = await response.text();
      expect(text).toBe('Invalid report format');
    });
  });

  describe('edge cases', () => {
    test('accepts request at exactly size limit', async () => {
      const handler = getPostHandler();

      const request = new Request('http://localhost/api/csp-report', {
        method: 'POST',
        headers: { 'Content-Length': '4096' }, // Exactly at MAX_BODY_SIZE
        body: JSON.stringify({
          'csp-report': {
            'document-uri': 'https://example.com',
            'violated-directive': 'script-src',
            'effective-directive': 'script-src',
            'original-policy': "default-src 'self'",
            'blocked-uri': 'inline',
            'status-code': 200,
          },
        }),
      });

      const response = await handler!({ request });

      expect(response.status).toBe(204);
    });

    test('rejects request one byte over size limit', async () => {
      const handler = getPostHandler();

      const request = new Request('http://localhost/api/csp-report', {
        method: 'POST',
        headers: { 'Content-Length': '4097' }, // One byte over MAX_BODY_SIZE
        body: JSON.stringify({ 'csp-report': {} }),
      });

      const response = await handler!({ request });

      expect(response.status).toBe(413);
    });

    test('handles request without Content-Length header', async () => {
      const handler = getPostHandler();

      const report = {
        'csp-report': {
          'document-uri': 'https://example.com',
          'violated-directive': 'script-src',
          'effective-directive': 'script-src',
          'original-policy': "default-src 'self'",
          'blocked-uri': 'inline',
          'status-code': 200,
        },
      };

      // Request without explicit Content-Length
      const request = new Request('http://localhost/api/csp-report', {
        method: 'POST',
        body: JSON.stringify(report),
      });

      const response = await handler!({ request });

      expect(response.status).toBe(204);
    });
  });
});
