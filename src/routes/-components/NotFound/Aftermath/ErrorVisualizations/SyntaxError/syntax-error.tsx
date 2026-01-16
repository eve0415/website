import type { FC } from 'react';

import { Link } from '@tanstack/react-router';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useReducedMotion } from '#hooks/useReducedMotion';

interface CodeLine {
  lineNumber: number;
  content: string;
  hasError: boolean;
  errorStart?: number;
  errorEnd?: number;
}

// VS Code-style code editor with syntax error visualization
const SyntaxError: FC = () => {
  const reducedMotion = useReducedMotion();

  const codeLines = useMemo(
    (): CodeLine[] => [
      { lineNumber: 1, content: "import { useState } from 'react';", hasError: false },
      { lineNumber: 2, content: '', hasError: false },
      { lineNumber: 3, content: 'const Page = () => {', hasError: false },
      { lineNumber: 4, content: '  const [data, setData] = useState(null);', hasError: false },
      { lineNumber: 5, content: '', hasError: false },
      { lineNumber: 6, content: '  return (', hasError: false },
      { lineNumber: 7, content: "    <div className='page'>", hasError: true, errorStart: 4, errorEnd: 5 },
      { lineNumber: 8, content: '      {data.map(item => <Item key={item.id} />)}', hasError: false },
      { lineNumber: 9, content: '    </div>', hasError: false },
      { lineNumber: 10, content: '  );', hasError: false },
      { lineNumber: 11, content: '};', hasError: false },
      { lineNumber: 12, content: '', hasError: false },
      { lineNumber: 13, content: 'export default Page;', hasError: false },
    ],
    [],
  );

  const [visibleLines, setVisibleLines] = useState<number>(() => (reducedMotion ? codeLines.length : 0));
  const [cursorVisible, setCursorVisible] = useState(true);
  const [showError, setShowError] = useState(() => reducedMotion);
  const [parserFragments, setParserFragments] = useState<{ id: number; x: number; y: number; char: string }[]>([]);

  const lineIndexRef = useRef(0);

  // Animate code typing
  useEffect(() => {
    if (reducedMotion) return;

    const typeInterval = setInterval(() => {
      if (lineIndexRef.current < codeLines.length) {
        lineIndexRef.current += 1;
        setVisibleLines(lineIndexRef.current);
      } else {
        clearInterval(typeInterval);
        setTimeout(() => {
          setShowError(true);
          // Create parser fragment explosion
          const fragments = [];
          for (let i = 0; i < 20; i++) {
            fragments.push({
              id: i,
              x: Math.random() * 200 - 100,
              y: Math.random() * 200 - 100,
              char: ['<', '/', '>', '{', '}', '(', ')', ';', '='][Math.floor(Math.random() * 9)]!,
            });
          }
          setParserFragments(fragments);
        }, 500);
      }
    }, 80);

    return () => clearInterval(typeInterval);
  }, [reducedMotion, codeLines.length]);

  // Cursor blink
  useEffect(() => {
    const interval = setInterval(() => setCursorVisible(v => !v), 530);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className='bg-background fixed inset-0 overflow-x-hidden overflow-y-auto'>
      {/* VS Code style header */}
      <div className='flex h-9 items-center border-b border-[#3c3c3c] bg-[#1e1e1e] px-4'>
        <div className='flex gap-2'>
          <div className='size-3 rounded-full bg-[#ff5f57]' />
          <div className='size-3 rounded-full bg-[#febc2e]' />
          <div className='size-3 rounded-full bg-[#28c840]' />
        </div>
        <span className='ml-4 font-mono text-xs text-[#cccccc]'>page.tsx - SyntaxError</span>
      </div>

      <div className='flex h-[calc(100%-2.25rem)] flex-col md:flex-row'>
        {/* Line numbers gutter */}
        <div className='hidden w-14 border-r border-[#3c3c3c] bg-[#1e1e1e] pt-2 md:block'>
          {codeLines.slice(0, visibleLines).map(line => (
            <div
              key={line.lineNumber}
              className={`pr-4 text-right font-mono text-xs leading-6 ${line.hasError && showError ? 'bg-[#f14c4c]/20 text-[#f14c4c]' : 'text-[#858585]'}`}
            >
              {line.lineNumber}
            </div>
          ))}
        </div>

        {/* Code editor */}
        <div className='relative h-1/2 flex-1 overflow-hidden bg-[#1e1e1e] pt-2 md:h-auto'>
          {codeLines.slice(0, visibleLines).map((line, idx) => (
            <div key={line.lineNumber} className={`relative font-mono text-sm leading-6 ${line.hasError && showError ? 'bg-[#f14c4c]/10' : ''}`}>
              <pre className='pl-4 text-[#d4d4d4]'>
                {line.content}
                {idx === visibleLines - 1 && cursorVisible && <span className='inline-block h-5 w-0.5 translate-y-0.5 bg-[#aeafad]' />}
              </pre>

              {/* Error squiggle */}
              {line.hasError && showError && (
                <div
                  className='absolute bottom-0 left-4 h-0.5'
                  style={{
                    marginLeft: `${(line.errorStart ?? 0) * 0.6}rem`,
                    width: `${((line.errorEnd ?? 0) - (line.errorStart ?? 0)) * 0.6}rem`,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='6' height='3'%3E%3Cpath d='M0 3 L3 0 L6 3' stroke='%23f14c4c' fill='none'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'repeat-x',
                  }}
                />
              )}
            </div>
          ))}

          {/* Error tooltip */}
          {showError && (
            <div className='absolute top-40 left-20 z-10 max-w-md rounded border border-[#454545] bg-[#252526] p-3 shadow-xl'>
              <div className='flex items-start gap-2'>
                <span className='text-[#f14c4c]'>&#x2715;</span>
                <div>
                  <div className='font-mono text-xs text-[#f14c4c]'>SyntaxError: Unexpected token {"'<'"}</div>
                  <div className='mt-1 font-mono text-[10px] text-[#858585]'>jsx-parser(1:1)</div>
                </div>
              </div>
            </div>
          )}

          {/* Parser tree fragments (exploding on error) */}
          {showError &&
            parserFragments.map(frag => (
              <div
                key={frag.id}
                className='pointer-events-none absolute font-mono text-lg text-[#f14c4c]/60'
                style={{
                  left: `calc(50% + ${frag.x}px)`,
                  top: `calc(40% + ${frag.y}px)`,
                  animation: 'pulse 2s infinite',
                  animationDelay: `${frag.id * 50}ms`,
                }}
              >
                {frag.char}
              </div>
            ))}
        </div>

        {/* Problems panel */}
        <div className='h-1/2 w-full overflow-y-auto border-t border-[#3c3c3c] bg-[#1e1e1e] md:h-auto md:w-80 md:border-t-0 md:border-l'>
          <div className='flex items-center gap-2 border-b border-[#3c3c3c] px-4 py-2'>
            <span className='font-mono text-xs text-[#cccccc]'>PROBLEMS</span>
            {showError && <span className='rounded bg-[#f14c4c] px-1.5 py-0.5 font-mono text-[10px] text-white'>1</span>}
          </div>
          {showError && (
            <div className='p-2'>
              <div className='cursor-pointer rounded bg-[#f14c4c]/10 p-2 hover:bg-[#f14c4c]/20'>
                <div className='flex items-center gap-2'>
                  <span className='text-[#f14c4c]'>&#x2715;</span>
                  <span className='font-mono text-xs text-[#d4d4d4]'>Unexpected token {"'<'"}</span>
                </div>
                <div className='mt-1 pl-5 font-mono text-[10px] text-[#858585]'>page.tsx [7, 5]</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className='absolute inset-x-0 bottom-8 text-center'>
        <Link to='/' className='inline-flex items-center gap-2 rounded bg-[#0e639c] px-6 py-3 font-mono text-sm text-white transition-all hover:bg-[#1177bb]'>
          <span className='text-[#89d185]'>&#x25B6;</span>
          構文を修正 → ホームへ戻る
        </Link>
      </div>
    </div>
  );
};

export default SyntaxError;
