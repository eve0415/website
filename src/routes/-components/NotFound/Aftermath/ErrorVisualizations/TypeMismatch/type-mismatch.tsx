import type { FC } from 'react';

import { Link } from '@tanstack/react-router';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useReducedMotion } from '#hooks/useReducedMotion';

interface TypeBox {
  id: string;
  type: string;
  color: string;
  x: number;
  y: number;
}

// TypeScript compiler error visualization with type diagram
const TypeMismatch: FC = () => {
  const reducedMotion = useReducedMotion();

  const typeBoxes = useMemo(
    (): TypeBox[] => [
      { id: 'string', type: 'string', color: '#4ec9b0', x: 20, y: 35 },
      { id: 'number', type: 'number', color: '#b5cea8', x: 70, y: 35 },
      { id: 'boolean', type: 'boolean', color: '#569cd6', x: 20, y: 65 },
      { id: 'object', type: 'object', color: '#dcdcaa', x: 70, y: 65 },
    ],
    [],
  );

  const [errorCount, setErrorCount] = useState(() => (reducedMotion ? 5 : 0));
  const [showAssignment, setShowAssignment] = useState(() => reducedMotion);
  const [conflictPulse, setConflictPulse] = useState(false);

  const errorCountRef = useRef(0);

  // Animate error accumulation
  useEffect(() => {
    if (reducedMotion) return;

    errorCountRef.current = 0;
    const interval = setInterval(() => {
      if (errorCountRef.current < 5) {
        errorCountRef.current += 1;
        setErrorCount(errorCountRef.current);
      } else {
        clearInterval(interval);
        setShowAssignment(true);
      }
    }, 400);

    return () => clearInterval(interval);
  }, [reducedMotion]);

  // Conflict pulse
  useEffect(() => {
    if (!showAssignment || reducedMotion) return;

    const interval = setInterval(() => {
      setConflictPulse(p => !p);
    }, 500);

    return () => clearInterval(interval);
  }, [showAssignment, reducedMotion]);

  const errors = [
    { line: 12, msg: "Type 'string' is not assignable to type 'number'" },
    { line: 24, msg: "Argument of type 'null' is not assignable to parameter of type 'Page'" },
    { line: 37, msg: "Property 'id' does not exist on type 'undefined'" },
    { line: 45, msg: "Type 'boolean' is not assignable to type 'string'" },
    { line: 58, msg: "Cannot assign to 'readonly' property 'name'" },
  ];

  return (
    <div className='bg-background fixed inset-0 overflow-x-hidden overflow-y-auto'>
      {/* VS Code header with TypeScript */}
      <div className='flex h-9 items-center border-b border-[#3c3c3c] bg-[#1e1e1e] px-4'>
        <div className='flex gap-2'>
          <div className='size-3 rounded-full bg-[#ff5f57]' />
          <div className='size-3 rounded-full bg-[#febc2e]' />
          <div className='size-3 rounded-full bg-[#28c840]' />
        </div>
        <span className='ml-4 font-mono text-xs text-[#cccccc]'>page.tsx - TypeScript Error</span>
        <div className='ml-auto flex items-center gap-2'>
          <div className='rounded bg-[#3178c6] px-2 py-0.5 text-[10px] text-white'>TS</div>
        </div>
      </div>

      <div className='flex h-[calc(100%-2.25rem)]'>
        {/* Type diagram */}
        <div className='relative flex-1 bg-[#1e1e1e] p-8'>
          <div className='mb-4 font-mono text-xs text-[#858585]'>Type System - Assignment Check</div>

          {/* Type boxes */}
          {typeBoxes.map(box => (
            <div
              key={box.id}
              className='absolute -translate-x-1/2 -translate-y-1/2 rounded-lg border-2 bg-[#252526] px-6 py-3 font-mono transition-all duration-300'
              style={{
                left: `${box.x}%`,
                top: `${box.y}%`,
                borderColor: box.color,
                boxShadow:
                  showAssignment && (box.id === 'string' || box.id === 'number')
                    ? conflictPulse
                      ? `0 0 30px ${box.color}60`
                      : `0 0 15px ${box.color}30`
                    : 'none',
              }}
            >
              <div style={{ color: box.color }}>{box.type}</div>
            </div>
          ))}

          {/* Assignment arrow (string -> number) */}
          {showAssignment && (
            <svg className='absolute inset-0 h-full w-full'>
              <defs>
                <marker id='arrowhead' markerWidth='10' markerHeight='7' refX='9' refY='3.5' orient='auto'>
                  <polygon points='0 0, 10 3.5, 0 7' fill='#f14c4c' />
                </marker>
              </defs>
              <line
                x1='28%'
                y1='35%'
                x2='62%'
                y2='35%'
                stroke='#f14c4c'
                strokeWidth='3'
                strokeDasharray={conflictPulse ? '10,5' : '0'}
                markerEnd='url(#arrowhead)'
              />
              <text x='45%' y='30%' fill='#f14c4c' fontSize='12' fontFamily='monospace' textAnchor='middle'>
                &#x2717; Cannot assign
              </text>
            </svg>
          )}

          {/* Type constraint display */}
          <div className='absolute bottom-24 left-8 max-w-md rounded border border-[#3c3c3c] bg-[#252526] p-4'>
            <div className='mb-2 font-mono text-xs text-[#858585]'>// Type definition</div>
            <pre className='font-mono text-xs text-[#d4d4d4]'>
              <span className='text-[#c586c0]'>interface</span> <span className='text-[#4ec9b0]'>PageData</span> {'{'}
              {'\n'}
              {'  '}
              <span className='text-[#9cdcfe]'>id</span>: <span className='text-[#4ec9b0]'>number</span>;{'\n'}
              {'  '}
              <span className='text-[#9cdcfe]'>title</span>: <span className='text-[#4ec9b0]'>string</span>;{'\n'}
              {'}'}
            </pre>
          </div>
        </div>

        {/* Problems panel */}
        <div className='w-96 border-l border-[#3c3c3c] bg-[#1e1e1e]'>
          <div className='flex items-center gap-2 border-b border-[#3c3c3c] px-4 py-2'>
            <span className='font-mono text-xs text-[#cccccc]'>PROBLEMS</span>
            {errorCount > 0 && <span className='rounded bg-[#f14c4c] px-1.5 py-0.5 font-mono text-[10px] text-white'>{errorCount}</span>}
          </div>
          <div className='max-h-80 space-y-1 overflow-y-auto p-2'>
            {errors.slice(0, errorCount).map((error, i) => (
              <div key={i} className='cursor-pointer rounded bg-[#f14c4c]/10 p-2 transition-colors hover:bg-[#f14c4c]/20'>
                <div className='flex items-start gap-2'>
                  <span className='text-[#f14c4c]'>&#x2715;</span>
                  <span className='font-mono text-xs text-[#d4d4d4]'>{error.msg}</span>
                </div>
                <div className='mt-1 pl-5 font-mono text-[10px] text-[#858585]'>page.tsx [{error.line}, 1]</div>
              </div>
            ))}
          </div>

          {/* tsc output */}
          <div className='border-t border-[#3c3c3c] p-4'>
            <div className='font-mono text-[10px] text-[#f14c4c]'>
              Found {errorCount} error{errorCount !== 1 ? 's' : ''} in page.tsx
            </div>
            <div className='mt-2 font-mono text-[10px] text-[#858585]'>tsc --noEmit exited with code 1</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className='absolute inset-x-0 bottom-8 text-center'>
        <Link to='/' className='inline-flex items-center gap-2 rounded bg-[#0e639c] px-6 py-3 font-mono text-sm text-white transition-all hover:bg-[#1177bb]'>
          <span className='text-[#89d185]'>&#x25B6;</span>
          型を合わせる → ホームへ戻る
        </Link>
      </div>
    </div>
  );
};

export default TypeMismatch;
