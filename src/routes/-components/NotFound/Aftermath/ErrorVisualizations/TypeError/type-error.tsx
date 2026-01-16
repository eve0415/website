import type { FC } from 'react';

import { Link } from '@tanstack/react-router';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useReducedMotion } from '#hooks/useReducedMotion';

interface ObjectNode {
  id: string;
  label: string;
  value: string | null;
  x: number;
  y: number;
  isUndefined: boolean;
}

// Object graph visualization showing undefined property access
const TypeError: FC = () => {
  const reducedMotion = useReducedMotion();

  const nodes = useMemo(
    (): ObjectNode[] => [
      { id: 'root', label: 'response', value: '{}', x: 50, y: 30, isUndefined: false },
      { id: 'data', label: 'data', value: '{}', x: 30, y: 50, isUndefined: false },
      { id: 'user', label: 'user', value: 'null', x: 70, y: 50, isUndefined: false },
      { id: 'items', label: 'items', value: '[]', x: 15, y: 70, isUndefined: false },
      { id: 'page', label: 'page', value: 'undefined', x: 45, y: 70, isUndefined: true },
      { id: 'meta', label: 'meta', value: 'undefined', x: 85, y: 70, isUndefined: true },
    ],
    [],
  );

  const [highlightedPath, setHighlightedPath] = useState<string[]>(() => (reducedMotion ? ['root', 'data', 'page'] : []));
  const [showCrash, setShowCrash] = useState(() => reducedMotion);
  const [glitchOffset, setGlitchOffset] = useState(0);

  const pathIndexRef = useRef(0);

  // Animate path traversal
  useEffect(() => {
    if (reducedMotion) return;

    const path = ['root', 'data', 'page'];
    pathIndexRef.current = 0;

    const interval = setInterval(() => {
      if (pathIndexRef.current < path.length) {
        pathIndexRef.current += 1;
        setHighlightedPath(path.slice(0, pathIndexRef.current));

        if (pathIndexRef.current === path.length) {
          setTimeout(() => setShowCrash(true), 300);
        }
      } else {
        clearInterval(interval);
      }
    }, 600);

    return () => clearInterval(interval);
  }, [reducedMotion]);

  // Glitch effect
  useEffect(() => {
    if (!showCrash || reducedMotion) return;

    const interval = setInterval(() => {
      setGlitchOffset(Math.random() * 4 - 2);
      setTimeout(() => setGlitchOffset(0), 50);
    }, 200);

    return () => clearInterval(interval);
  }, [showCrash, reducedMotion]);

  const getNodeColor = (node: ObjectNode) => {
    if (node.isUndefined && highlightedPath.includes(node.id)) return '#f14c4c';
    if (highlightedPath.includes(node.id)) return '#4fc1ff';
    return '#858585';
  };

  return (
    <div className='bg-background fixed inset-0 overflow-hidden'>
      {/* Chrome DevTools style header */}
      <div className='flex h-9 items-center border-b border-[#3c3c3c] bg-[#1e1e1e] px-4'>
        <div className='flex gap-2'>
          <div className='size-3 rounded-full bg-[#ff5f57]' />
          <div className='size-3 rounded-full bg-[#febc2e]' />
          <div className='size-3 rounded-full bg-[#28c840]' />
        </div>
        <span className='ml-4 font-mono text-xs text-[#cccccc]'>Console - TypeError</span>
      </div>

      <div className='flex h-[calc(100%-2.25rem)]'>
        {/* Object graph visualization */}
        <div className='relative flex-1 bg-[#1e1e1e] p-8'>
          <div className='mb-4 font-mono text-xs text-[#858585]'>Object Graph - Property Access Path</div>

          {/* SVG for connections */}
          <svg className='absolute inset-0 h-full w-full'>
            {/* root -> data */}
            <line x1='50%' y1='30%' x2='30%' y2='50%' stroke={highlightedPath.includes('data') ? '#4fc1ff' : '#3c3c3c'} strokeWidth='2' />
            {/* root -> user */}
            <line x1='50%' y1='30%' x2='70%' y2='50%' stroke='#3c3c3c' strokeWidth='2' />
            {/* data -> items */}
            <line x1='30%' y1='50%' x2='15%' y2='70%' stroke='#3c3c3c' strokeWidth='2' />
            {/* data -> page */}
            <line
              x1='30%'
              y1='50%'
              x2='45%'
              y2='70%'
              stroke={highlightedPath.includes('page') ? '#f14c4c' : '#3c3c3c'}
              strokeWidth='2'
              strokeDasharray={highlightedPath.includes('page') ? '5,5' : '0'}
            />
            {/* user -> meta */}
            <line x1='70%' y1='50%' x2='85%' y2='70%' stroke='#3c3c3c' strokeWidth='2' strokeDasharray='5,5' />
          </svg>

          {/* Nodes */}
          {nodes.map(node => (
            <div
              key={node.id}
              className='absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300'
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
                transform:
                  showCrash && node.isUndefined && highlightedPath.includes(node.id) ? `translate(-50%, -50%) translateX(${glitchOffset}px)` : undefined,
              }}
            >
              <div
                className='rounded-lg border-2 bg-[#252526] px-4 py-2 font-mono text-sm transition-all'
                style={{
                  borderColor: getNodeColor(node),
                  boxShadow: highlightedPath.includes(node.id) ? `0 0 20px ${getNodeColor(node)}40` : 'none',
                }}
              >
                <div className='text-[#569cd6]'>.{node.label}</div>
                <div className={node.isUndefined ? 'text-[#f14c4c]' : 'text-[#ce9178]'}>{node.value}</div>
              </div>
            </div>
          ))}

          {/* Access path indicator */}
          <div className='absolute bottom-20 left-8 font-mono text-sm'>
            <span className='text-[#858585]'>Access: </span>
            <span className='text-[#4fc1ff]'>response</span>
            {highlightedPath.includes('data') && (
              <>
                <span className='text-[#858585]'>.</span>
                <span className='text-[#4fc1ff]'>data</span>
              </>
            )}
            {highlightedPath.includes('page') && (
              <>
                <span className='text-[#858585]'>.</span>
                <span className='text-[#f14c4c]'>page</span>
              </>
            )}
          </div>
        </div>

        {/* Console panel */}
        <div className='w-96 border-l border-[#3c3c3c] bg-[#1e1e1e]'>
          <div className='border-b border-[#3c3c3c] px-4 py-2'>
            <span className='font-mono text-xs text-[#cccccc]'>Console</span>
          </div>
          <div className='p-4'>
            {showCrash && (
              <div className='rounded border-l-4 border-[#f14c4c] bg-[#f14c4c]/10 p-3'>
                <div className='flex items-start gap-2'>
                  <span className='text-[#f14c4c]'>&#x2715;</span>
                  <div className='font-mono text-xs'>
                    <div className='text-[#f14c4c]'>Uncaught TypeError: Cannot read properties of undefined (reading {"'page'"})</div>
                    <div className='mt-2 text-[#858585]'>
                      {'    '}at fetchPage (app.js:404:15)
                      <br />
                      {'    '}at processResponse (api.js:42:8)
                      <br />
                      {'    '}at async handleRequest (server.js:12:5)
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className='absolute inset-x-0 bottom-8 text-center'>
        <Link to='/' className='inline-flex items-center gap-2 rounded bg-[#0e639c] px-6 py-3 font-mono text-sm text-white transition-all hover:bg-[#1177bb]'>
          <span className='text-[#89d185]'>&#x25B6;</span>
          型を検証 → ホームへ戻る
        </Link>
      </div>
    </div>
  );
};

export default TypeError;
