import { createFileRoute } from '@tanstack/react-router';

// CSP violation report structure
interface CspViolationReport {
  'csp-report'?: {
    'document-uri': string;
    'violated-directive': string;
    'effective-directive': string;
    'original-policy': string;
    'blocked-uri': string;
    'status-code': number;
    'source-file'?: string;
    'line-number'?: number;
    'column-number'?: number;
  };
}

export const Route = createFileRoute('/api/csp-report')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const report: CspViolationReport = await request.json();
          const violation = report['csp-report'];

          if (violation) {
            console.warn('[CSP Violation]', {
              documentUri: violation['document-uri'],
              violatedDirective: violation['violated-directive'],
              blockedUri: violation['blocked-uri'],
              sourceFile: violation['source-file'],
              lineNumber: violation['line-number'],
            });
          }
        } catch (error) {
          console.error('[CSP Report] Failed to parse report:', error);
        }

        // Always return 204 No Content for CSP reports
        return new Response(null, { status: 204 });
      },
    },
  },
});
