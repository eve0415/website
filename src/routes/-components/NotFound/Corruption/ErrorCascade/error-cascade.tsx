import type { FC } from 'react';

import { useMemo } from 'react';

import { useReducedMotion } from '#hooks/useReducedMotion';

import { getErrorColorClass } from '../useCorruptionEffects';

interface CascadeError {
  id: number;
  message: string;
  language: string;
  stack: string[];
  threshold: number; // Progress threshold to show this error (0-1)
}

// Error cascade data - appears progressively
const CASCADE_ERRORS: CascadeError[] = [
  // Stage 1 - Early errors (0-0.3)
  {
    id: 1,
    message: "ENOENT: no such file or directory, open '/page'",
    language: 'node',
    stack: [
      '    at Object.openSync (node:fs:601:3)',
      '    at readFileSync (node:fs:569:35)',
      '    at Module._compile (node:internal/modules/cjs/loader:1275:14)',
    ],
    threshold: 0.05,
  },
  {
    id: 2,
    message: "KeyError: 'page' not in routes",
    language: 'python',
    stack: ['  File "app.py", line 42, in get_route', '    return routes[path]', '  File "<frozen _collections_abc>", line 941, in __getitem__'],
    threshold: 0.15,
  },
  // Stage 2 - Escalating (0.3-0.6)
  {
    id: 3,
    message: "TypeError: Cannot read property 'render' of undefined",
    language: 'javascript',
    stack: [
      '    at Component.mount (webpack:///./src/framework.js:127:15)',
      '    at reconcileChildren (webpack:///./src/reconciler.js:89:5)',
      '    at updateFunctionComponent (webpack:///./src/fiber.js:234:9)',
    ],
    threshold: 0.3,
  },
  {
    id: 4,
    message: 'java.lang.NullPointerException: Cannot invoke "Page.getContent()"',
    language: 'java',
    stack: [
      '    at com.app.Router.handleRequest(Router.java:157)',
      '    at com.app.Server$Handler.run(Server.java:89)',
      '    at java.base/java.lang.Thread.run(Thread.java:833)',
    ],
    threshold: 0.4,
  },
  {
    id: 5,
    message: 'panic: runtime error: invalid memory address or nil pointer dereference',
    language: 'go',
    stack: ['goroutine 1 [running]:', 'main.handleRoute(0x0)', '    /app/main.go:47 +0x1c', 'main.main()', '    /app/main.go:23 +0x85'],
    threshold: 0.5,
  },
  // Stage 3 - Catastrophic (0.6-1.0)
  {
    id: 6,
    message: 'Segmentation fault (core dumped)',
    language: 'c',
    stack: [
      'Program terminated with signal SIGSEGV, Segmentation fault.',
      '#0  0x00007f3a2b4c2a47 in __GI___libc_read () from /lib/x86_64-linux-gnu/libc.so.6',
      '#1  0x000055a8c7d21f23 in ?? ()',
    ],
    threshold: 0.65,
  },
  {
    id: 7,
    message: 'FATAL ERROR: CALL_AND_RETRY_LAST Allocation failed - JavaScript heap out of memory',
    language: 'node',
    stack: [
      '<--- Last few GCs --->',
      '[48147:0x5629c40]    23145 ms: Mark-sweep 2047.9 (2051.4) -> 2047.3 (2052.9) MB',
      '[48147:0x5629c40]    23298 ms: Mark-sweep (reduce) 2047.9 (2052.9) -> 2047.3 (2049.4) MB',
    ],
    threshold: 0.75,
  },
  {
    id: 8,
    message: 'Kernel panic - not syncing: Fatal exception in interrupt',
    language: 'kernel',
    stack: [
      'CPU: 0 PID: 0 Comm: swapper/0 Not tainted 5.15.0-generic',
      'Hardware name: QEMU Standard PC (i440FX + PIIX, 1996)',
      'Call Trace:',
      ' <IRQ>',
      ' asm_exc_page_fault+0x1e/0x30',
    ],
    threshold: 0.85,
  },
];

interface ErrorCascadeProps {
  progress: number; // 0-1 through corruption phase
  enabled: boolean;
}

const ErrorCascade: FC<ErrorCascadeProps> = ({ progress, enabled }) => {
  const prefersReducedMotion = useReducedMotion();

  // Calculate visible errors using exponential curve (slow start, rapid end)
  const visibleErrors = useMemo(() => {
    if (!enabled || progress < 0.05) return [];

    // Exponential curve: more errors appear faster as progress increases
    const effectiveProgress = Math.pow(progress, 0.7); // Slightly accelerated curve

    return CASCADE_ERRORS.filter(error => effectiveProgress >= error.threshold);
  }, [enabled, progress]);

  if (!enabled || visibleErrors.length === 0) return null;

  return (
    <div
      className='absolute inset-x-4 top-1/2 max-h-[70vh] -translate-y-1/2 overflow-hidden font-mono text-xs sm:inset-x-8 sm:text-sm'
      style={{
        maskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)',
      }}
    >
      <div className='flex flex-col gap-3'>
        {visibleErrors.map((error, errorIndex) => (
          <div
            key={error.id}
            className='rounded border border-line/30 bg-background/80 p-3 backdrop-blur-sm'
            style={
              prefersReducedMotion
                ? { opacity: 1 }
                : {
                    animation: 'error-cascade-in 200ms ease-out forwards',
                    animationDelay: `${errorIndex * 30}ms`,
                    opacity: 0,
                  }
            }
          >
            {/* Error message */}
            <div className={`font-semibold ${getErrorColorClass(error.language)}`}>{error.message}</div>

            {/* Stack trace lines */}
            <div className='mt-2 space-y-0.5'>
              {error.stack.map((line, lineIndex) => (
                <div
                  key={lineIndex}
                  className='text-muted-foreground'
                  style={
                    prefersReducedMotion
                      ? { opacity: 1 }
                      : {
                          animation: 'error-cascade-in 150ms ease-out forwards',
                          animationDelay: `${errorIndex * 30 + (lineIndex + 1) * 20}ms`,
                          opacity: 0,
                        }
                  }
                >
                  {line}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ErrorCascade;
