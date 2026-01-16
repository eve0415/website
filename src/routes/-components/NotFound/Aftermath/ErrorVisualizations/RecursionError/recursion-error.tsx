import type { FC } from 'react';

import { Link } from '@tanstack/react-router';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useReducedMotion } from '#hooks/useReducedMotion';

// Fractal infinite recursion visualization
const RecursionError: FC = () => {
  const reducedMotion = useReducedMotion();

  const [depth, setDepth] = useState(() => (reducedMotion ? 8 : 0));
  const [crashed, setCrashed] = useState(() => reducedMotion);
  const [zoomLevel, setZoomLevel] = useState(1);

  const depthRef = useRef(0);

  // Generate nested boxes for fractal effect
  const boxes = useMemo(() => {
    const result = [];
    for (let i = 0; i <= depth; i++) {
      result.push({
        scale: Math.pow(0.75, i),
        rotation: i * 5,
        opacity: 1 - i * 0.1,
      });
    }
    return result;
  }, [depth]);

  // Animate recursion depth
  useEffect(() => {
    if (reducedMotion) return;

    depthRef.current = 0;
    const interval = setInterval(() => {
      if (depthRef.current < 8) {
        depthRef.current += 1;
        setDepth(depthRef.current);
      } else {
        clearInterval(interval);
        setCrashed(true);
      }
    }, 400);

    return () => clearInterval(interval);
  }, [reducedMotion]);

  // Zoom animation
  useEffect(() => {
    if (reducedMotion || !crashed) return;

    const interval = setInterval(() => {
      setZoomLevel(z => (z >= 2 ? 1 : z + 0.02));
    }, 50);

    return () => clearInterval(interval);
  }, [reducedMotion, crashed]);

  return (
    <div className='bg-background fixed inset-0 overflow-hidden'>
      {/* Python terminal header */}
      <div className='bg-muted flex h-9 items-center border-b border-[#3776ab]/30 px-4'>
        <span className='font-mono text-xs text-[#3776ab]'>Python 3.12.0 - RecursionError</span>
      </div>

      <div className='flex h-[calc(100%-2.25rem)]'>
        {/* Fractal visualization */}
        <div className='bg-background relative flex-1 overflow-hidden'>
          {/* Centered fractal boxes */}
          <div
            className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
            style={{
              transform: `translate(-50%, -50%) scale(${zoomLevel})`,
              transition: 'transform 0.1s linear',
            }}
          >
            {boxes.map((box, i) => (
              <div
                key={i}
                className='absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-lg border-2 border-[#ff6b6b] bg-[#ff6b6b]/5'
                style={{
                  width: `${300 * box.scale}px`,
                  height: `${200 * box.scale}px`,
                  opacity: box.opacity,
                  transform: `translate(-50%, -50%) rotate(${box.rotation}deg)`,
                }}
              >
                {i === depth && (
                  <div className='font-mono text-xs text-[#ff6b6b]' style={{ fontSize: `${Math.max(8, 14 * box.scale)}px` }}>
                    findPage(depth={depth})
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Depth indicator */}
          <div className='absolute top-8 left-8 font-mono text-xs'>
            <div className='text-[#888]'>Recursion Depth</div>
            <div className='mt-1 text-2xl text-[#ff6b6b]'>{depth} / 1000</div>
          </div>

          {/* Crash overlay */}
          {crashed && (
            <div className='absolute inset-0 flex items-center justify-center bg-black/80'>
              <div className='text-center'>
                <div className='font-mono text-4xl text-[#ff6b6b]'>RECURSION LIMIT</div>
                <div className='mt-4 font-mono text-lg text-[#ff6b6b]/70'>maximum recursion depth exceeded</div>
                <div className='mt-8 font-mono text-6xl'>&#x1F300;</div>
              </div>
            </div>
          )}
        </div>

        {/* Stack trace panel */}
        <div className='bg-muted w-80 border-l border-[#333] p-4'>
          <div className='mb-4 font-mono text-xs text-[#3776ab]'>Traceback (most recent call last):</div>

          <div className='max-h-96 space-y-1 overflow-hidden'>
            {Array.from({ length: Math.min(depth + 1, 15) }).map((_, i) => (
              <div key={i} className='font-mono text-[10px]' style={{ opacity: 1 - i * 0.06 }}>
                <div className='text-[#888]'>File "page.py", line 404, in findPage</div>
                <div className='pl-4 text-[#d4d4d4]'>return findPage(depth + 1)</div>
              </div>
            ))}
            {depth > 5 && <div className='py-2 text-center font-mono text-xs text-[#666]'>[Previous {depth * 100} frames not shown]</div>}
          </div>

          {crashed && (
            <div className='mt-4 rounded border border-[#ff6b6b]/50 bg-[#ff6b6b]/10 p-3'>
              <div className='font-mono text-xs text-[#ff6b6b]'>RecursionError: maximum recursion depth exceeded</div>
              <div className='mt-2 font-mono text-[10px] text-[#888]'>sys.setrecursionlimit(1000) # default</div>
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
          再帰を終了 → ホームへ戻る
        </Link>
      </div>
    </div>
  );
};

export default RecursionError;
