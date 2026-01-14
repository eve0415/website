import { createFileRoute } from '@tanstack/react-router';

// Maximum request body size (4KB)
const MAX_BODY_SIZE = 4096;

// CSP violation report structure (report-uri format)
interface CspReportUriFormat {
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

// Reporting API format (report-to directive)
interface ReportingApiFormat {
  type: string;
  age: number;
  url: string;
  user_agent: string;
  body: {
    documentURL?: string;
    blockedURL?: string;
    effectiveDirective?: string;
    originalPolicy?: string;
    sourceFile?: string;
    lineNumber?: number;
    columnNumber?: number;
  };
}

type CspReport = CspReportUriFormat | ReportingApiFormat[];

function isReportUriFormat(report: CspReport): report is CspReportUriFormat {
  return !Array.isArray(report) && typeof report === 'object' && 'csp-report' in report;
}

function isReportingApiFormat(report: CspReport): report is ReportingApiFormat[] {
  return Array.isArray(report) && report.length > 0 && typeof report[0] === 'object' && 'type' in report[0];
}

export const Route = createFileRoute('/api/csp-report')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Check Content-Length header for size limit
        const contentLength = request.headers.get('Content-Length');
        if (contentLength && Number.parseInt(contentLength, 10) > MAX_BODY_SIZE) {
          return new Response('Request body too large', { status: 413 });
        }

        try {
          const report: CspReport = await request.json();

          // Handle report-uri format
          if (isReportUriFormat(report)) {
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
            return new Response(null, { status: 204 });
          }

          // Handle Reporting API format (report-to directive)
          if (isReportingApiFormat(report)) {
            for (const entry of report) {
              if (entry.type === 'csp-violation' && entry.body) {
                console.warn('[CSP Violation]', {
                  documentUri: entry.body.documentURL,
                  violatedDirective: entry.body.effectiveDirective,
                  blockedUri: entry.body.blockedURL,
                  sourceFile: entry.body.sourceFile,
                  lineNumber: entry.body.lineNumber,
                });
              }
            }
            return new Response(null, { status: 204 });
          }

          // Invalid report structure
          console.error('[CSP Report] Invalid report structure:', typeof report);
          return new Response('Invalid report format', { status: 400 });
        } catch (error) {
          console.error('[CSP Report] Failed to parse report:', error);
          return new Response('Invalid JSON', { status: 400 });
        }
      },
    },
  },
});
