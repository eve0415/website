import type { FC } from 'react';

import { Link } from '@tanstack/react-router';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useReducedMotion } from '#hooks/useReducedMotion';

interface TestCase {
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  assertion?: { expected: string; actual: string };
}

// Test runner visualization with failing assertion
const AssertionError: FC = () => {
  const reducedMotion = useReducedMotion();

  const initialTests = useMemo(
    (): TestCase[] => [
      { name: 'test_home_page_loads', status: reducedMotion ? 'passed' : 'pending' },
      { name: 'test_navigation_works', status: reducedMotion ? 'passed' : 'pending' },
      { name: 'test_page_returns_200', status: reducedMotion ? 'failed' : 'pending', assertion: { expected: '200', actual: '404' } },
      { name: 'test_content_renders', status: reducedMotion ? 'pending' : 'pending' },
      { name: 'test_footer_visible', status: reducedMotion ? 'pending' : 'pending' },
    ],
    [reducedMotion],
  );

  const [tests, setTests] = useState<TestCase[]>(initialTests);
  const [progress, setProgress] = useState(() => (reducedMotion ? 60 : 0));
  const [, setCurrentTest] = useState<number | null>(() => (reducedMotion ? null : 0));
  const [showFailure, setShowFailure] = useState(() => reducedMotion);

  const testIndexRef = useRef(0);

  // Animate test execution
  useEffect(() => {
    if (reducedMotion) return;

    testIndexRef.current = 0;
    const interval = setInterval(() => {
      if (testIndexRef.current < tests.length) {
        const currentIndex = testIndexRef.current;
        setCurrentTest(currentIndex);
        setTests(prev => prev.map((t, i) => (i === currentIndex ? { ...t, status: 'running' } : t)));

        setTimeout(() => {
          const isPassing = currentIndex !== 2; // Third test fails
          setTests(prev => prev.map((t, i) => (i === currentIndex ? { ...t, status: isPassing ? 'passed' : 'failed' } : t)));
          setProgress((currentIndex + 1) * 20);

          if (!isPassing) {
            setShowFailure(true);
            clearInterval(interval);
          }

          testIndexRef.current += 1;
        }, 400);
      } else {
        clearInterval(interval);
      }
    }, 800);

    return () => clearInterval(interval);
  }, [reducedMotion, tests.length]);

  const passedCount = tests.filter(t => t.status === 'passed').length;
  const failedCount = tests.filter(t => t.status === 'failed').length;

  return (
    <div className='bg-background fixed inset-0 overflow-hidden'>
      {/* pytest header */}
      <div className='bg-muted flex h-9 items-center border-b border-[#3776ab]/30 px-4'>
        <span className='font-mono text-xs text-[#3776ab]'>pytest - AssertionError</span>
      </div>

      <div className='bg-background flex h-[calc(100%-2.25rem)]'>
        {/* Test runner visualization */}
        <div className='flex-1 p-8'>
          <div className='mx-auto max-w-xl'>
            {/* Progress bar */}
            <div className='mb-6'>
              <div className='mb-2 flex justify-between font-mono text-xs'>
                <span className='text-[#888]'>Running tests...</span>
                <span className='text-[#888]'>{progress}%</span>
              </div>
              <div className='h-2 overflow-hidden rounded bg-[#333]'>
                <div className={`h-full transition-all duration-300 ${failedCount > 0 ? 'bg-[#f44336]' : 'bg-[#4caf50]'}`} style={{ width: `${progress}%` }} />
              </div>
            </div>

            {/* Test list */}
            <div className='space-y-2'>
              {tests.map(test => (
                <div
                  key={test.name}
                  className={`flex items-center gap-4 rounded border p-3 font-mono text-sm transition-all ${
                    test.status === 'running'
                      ? 'border-[#2196f3] bg-[#2196f3]/10'
                      : test.status === 'passed'
                        ? 'border-[#4caf50]/50 bg-[#4caf50]/10'
                        : test.status === 'failed'
                          ? 'border-[#f44336] bg-[#f44336]/20'
                          : 'bg-muted border-[#333]'
                  }`}
                >
                  {/* Status icon */}
                  <span className='w-6 text-center'>
                    {test.status === 'pending' && <span className='text-[#666]'>○</span>}
                    {test.status === 'running' && <span className='animate-spin text-[#2196f3]'>◐</span>}
                    {test.status === 'passed' && <span className='text-[#4caf50]'>✓</span>}
                    {test.status === 'failed' && <span className='text-[#f44336]'>✗</span>}
                  </span>

                  <span className={test.status === 'failed' ? 'text-[#f44336]' : test.status === 'passed' ? 'text-[#4caf50]' : 'text-[#d4d4d4]'}>
                    {test.name}
                  </span>

                  {test.status === 'running' && <span className='ml-auto text-xs text-[#2196f3]'>running...</span>}
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className='mt-6 flex gap-4 font-mono text-sm'>
              <span className='text-[#4caf50]'>{passedCount} passed</span>
              {failedCount > 0 && <span className='text-[#f44336]'>{failedCount} failed</span>}
              <span className='text-[#888]'>{tests.length - passedCount - failedCount} pending</span>
            </div>

            {/* Assertion failure detail */}
            {showFailure && (
              <div className='mt-8 rounded border border-[#f44336]/50 bg-[#f44336]/10 p-4'>
                <div className='mb-3 font-mono text-sm text-[#f44336]'>FAILED test_page_returns_200</div>

                <div className='bg-muted rounded p-4 font-mono text-xs'>
                  <div className='text-[#888]'>&gt; assert response.status_code == 200</div>
                  <div className='mt-2 text-[#f44336]'>E AssertionError: assert 404 == 200</div>
                  <div className='mt-1 text-[#f44336]'>E + where 404 = &lt;Response&gt;.status_code</div>
                </div>

                <div className='mt-4 grid grid-cols-2 gap-4'>
                  <div className='rounded bg-[#4caf50]/20 p-3 text-center'>
                    <div className='font-mono text-xs text-[#888]'>Expected</div>
                    <div className='mt-1 font-mono text-2xl text-[#4caf50]'>200</div>
                  </div>
                  <div className='rounded bg-[#f44336]/20 p-3 text-center'>
                    <div className='font-mono text-xs text-[#888]'>Actual</div>
                    <div className='mt-1 font-mono text-2xl text-[#f44336]'>404</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Output panel */}
        <div className='bg-muted w-80 border-l border-[#333] p-4'>
          <div className='mb-4 font-mono text-xs text-[#3776ab]'>Test Output</div>

          <div className='space-y-1 font-mono text-[10px]'>
            <div className='text-[#888]'>============================= test session starts =============================</div>
            <div className='text-[#888]'>platform linux -- Python 3.12.0, pytest-7.4.0</div>
            <div className='text-[#888]'>collected 5 items</div>
            <div className='mt-2 text-[#888]'>test_pages.py .</div>
            {passedCount >= 1 && <div className='text-[#4caf50]'>test_home_page_loads PASSED</div>}
            {passedCount >= 2 && <div className='text-[#4caf50]'>test_navigation_works PASSED</div>}
            {failedCount > 0 && <div className='text-[#f44336]'>test_page_returns_200 FAILED</div>}
          </div>

          {showFailure && (
            <div className='mt-6 rounded border border-[#f44336]/30 bg-[#f44336]/5 p-3'>
              <div className='font-mono text-[10px] text-[#f44336]'>
                ================================ FAILURES ================================
                <br />
                <br />
                tests/test_pages.py:404: AssertionError
                <br />
                <br />
                =========================== short test summary ===========================
                <br />
                FAILED test_pages.py::test_page_returns_200 - AssertionError
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className='absolute inset-x-0 bottom-8 text-center'>
        <Link
          to='/'
          className='inline-flex items-center gap-2 rounded bg-[#3776ab]/20 px-6 py-3 font-mono text-sm text-[#3776ab] transition-all hover:bg-[#3776ab]/30'
        >
          テストを修正 → ホームへ戻る
        </Link>
      </div>
    </div>
  );
};

export default AssertionError;
