import type { FC } from 'react';

import { Link } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';

import { useReducedMotion } from '#hooks/useReducedMotion';

interface MemorySegment {
  name: string;
  start: string;
  end: string;
  permissions: string;
  isViolated: boolean;
}

// Seeded random for deterministic glitch positions
const seededRandom = (seed: number): number => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

// Glitchy/broken aesthetic visualization for Segmentation Fault
const SegFault: FC = () => {
  const reducedMotion = useReducedMotion();

  const [glitchPhase, setGlitchPhase] = useState(0);
  const [showCoreDump, setShowCoreDump] = useState(() => reducedMotion);

  const memorySegments = useMemo((): MemorySegment[] => {
    return [
      { name: 'TEXT', start: '0x00400000', end: '0x00401fff', permissions: 'r-x', isViolated: false },
      { name: 'DATA', start: '0x00600000', end: '0x00601fff', permissions: 'rw-', isViolated: false },
      { name: 'HEAP', start: '0x00700000', end: '0x007fffff', permissions: 'rw-', isViolated: false },
      { name: '???', start: '0x00000000', end: '0x000fffff', permissions: '---', isViolated: true },
      { name: 'STACK', start: '0x7fff0000', end: '0x7fffffff', permissions: 'rw-', isViolated: false },
    ];
  }, []);

  // Generate glitch blocks
  const glitchBlocks = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      x: seededRandom(i * 100) * 100,
      y: seededRandom(i * 100 + 50) * 100,
      width: 20 + seededRandom(i * 100 + 75) * 80,
      height: 5 + seededRandom(i * 100 + 100) * 20,
      color: seededRandom(i * 100 + 125) > 0.5 ? '#ff0040' : '#00ffff',
    }));
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    // Cycle through glitch phases
    const interval = setInterval(() => {
      setGlitchPhase(prev => (prev + 1) % 10);
    }, 150);

    // Show core dump after delay
    const timer = setTimeout(() => setShowCoreDump(true), 1500);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [reducedMotion]);

  return (
    <div className='fixed inset-0 overflow-hidden bg-[#0a0a0a]'>
      {/* Chromatic aberration effect */}
      <div
        className='pointer-events-none absolute inset-0 mix-blend-screen'
        style={{
          background: `linear-gradient(${90 + glitchPhase * 18}deg, rgba(255, 0, 64, 0.1) 0%, transparent 50%, rgba(0, 255, 255, 0.1) 100%)`,
          transform: `translate(${glitchPhase % 2 === 0 ? 2 : -2}px, 0)`,
        }}
      />

      {/* Glitch blocks */}
      {glitchBlocks.map(block => (
        <div
          key={block.id}
          className='pointer-events-none absolute mix-blend-screen'
          style={{
            left: `${block.x}%`,
            top: `${block.y}%`,
            width: block.width,
            height: block.height,
            backgroundColor: block.color,
            opacity: glitchPhase === block.id % 10 ? 0.6 : 0,
            transform: `translateX(${(glitchPhase % 3) * 5 - 5}px)`,
            transition: 'opacity 50ms, transform 50ms',
          }}
        />
      ))}

      {/* Scan lines with glitch offset */}
      <div
        className='pointer-events-none absolute inset-0 opacity-30'
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(255, 255, 255, 0.03) 2px,
            rgba(255, 255, 255, 0.03) 4px
          )`,
          transform: `translateY(${glitchPhase % 2}px)`,
        }}
      />

      <div className='relative flex h-full flex-col items-center justify-center p-6'>
        {/* Glitchy title */}
        <div className='relative mb-8 text-center'>
          <div
            className='font-bold font-mono text-5xl text-[#ff0040] sm:text-7xl'
            style={{
              textShadow: `
                ${glitchPhase % 2 === 0 ? 2 : -2}px 0 #00ffff,
                ${glitchPhase % 2 === 0 ? -2 : 2}px 0 #ff0040
              `,
              clipPath: glitchPhase % 3 === 0 ? 'polygon(0 0, 100% 0, 100% 45%, 0 45%)' : 'none',
            }}
          >
            SEGFAULT
          </div>
          {glitchPhase % 3 === 0 && (
            <div
              className='absolute top-1/2 left-0 w-full font-bold font-mono text-5xl text-[#00ffff] sm:text-7xl'
              style={{
                transform: 'translateX(5px)',
                clipPath: 'polygon(0 55%, 100% 55%, 100% 100%, 0 100%)',
              }}
            >
              SEGFAULT
            </div>
          )}
        </div>

        {/* Memory segment visualization */}
        <div className='mb-8 w-full max-w-2xl'>
          <div className='mb-2 font-mono text-[#999] text-xs'>MEMORY SEGMENTS</div>
          <div className='overflow-hidden rounded border border-[#333] bg-[#111]'>
            {memorySegments.map(seg => (
              <div
                key={seg.name}
                className={`flex items-center border-[#333] border-b p-3 font-mono text-sm last:border-b-0 ${
                  seg.isViolated ? 'animate-pulse bg-[#ff0040]/20' : ''
                }`}
                style={{
                  transform: seg.isViolated && glitchPhase % 2 === 0 ? 'translateX(3px)' : 'none',
                }}
              >
                <div className={`w-16 ${seg.isViolated ? 'text-[#ff0040]' : 'text-[#aaa]'}`}>{seg.name}</div>
                <div className='flex-1 text-[#999]'>
                  {seg.start} - {seg.end}
                </div>
                <div className={`font-mono ${seg.isViolated ? 'text-[#ff0040]' : 'text-[#5fb]'}`}>{seg.permissions}</div>
                {seg.isViolated && <div className='ml-4 rounded bg-[#ff0040] px-2 py-0.5 text-white text-xs'>VIOLATION</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Core dump message */}
        {showCoreDump && (
          <div className='mb-8 max-w-2xl animate-pulse rounded border border-[#ff0040]/50 bg-[#ff0040]/10 p-4 text-center'>
            <div className='font-mono text-[#ff0040] text-sm'>Segmentation fault (core dumped)</div>
            <div className='mt-1 font-mono text-[#999] text-xs'>Signal 11 (SIGSEGV) at address 0x00000000</div>
          </div>
        )}

        {/* Fix action */}
        <Link
          to='/'
          className='inline-flex items-center gap-2 rounded border border-[#ff0040]/50 bg-[#ff0040]/10 px-6 py-3 font-mono text-[#ff0040] text-sm transition-all hover:border-[#ff0040] hover:bg-[#ff0040]/20'
          style={{
            textShadow: '0 0 10px rgba(255, 0, 64, 0.5)',
          }}
        >
          <span className='animate-pulse'>⚠</span>
          メモリを修復 → ホームへ戻る
        </Link>
      </div>
    </div>
  );
};

export default SegFault;
