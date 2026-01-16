import type { FC } from 'react';

import { Link } from '@tanstack/react-router';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useReducedMotion } from '#hooks/useReducedMotion';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  velocity: { x: number; y: number };
}

// Seeded random for deterministic initial positions
const seededRandom = (seed: number): number => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

const PARTICLE_COLORS = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dfe6e9'];

// Generate initial particles (computed once, not in effect)
const createInitialParticles = (): Particle[] =>
  Array.from({ length: 50 }).map((_, i) => ({
    id: i,
    x: seededRandom(i * 100) * 100,
    y: seededRandom(i * 100 + 50) * 100,
    size: 8 + seededRandom(i * 100 + 75) * 24,
    color: PARTICLE_COLORS[i % PARTICLE_COLORS.length]!,
    velocity: {
      x: (seededRandom(i * 100 + 100) - 0.5) * 0.5,
      y: (seededRandom(i * 100 + 125) - 0.5) * 0.5,
    },
  }));

// Abstract/artistic particle visualization for OutOfMemoryError
const OutOfMemory: FC = () => {
  const reducedMotion = useReducedMotion();

  // Initialize particles via useMemo to avoid setState in effect
  const initialParticles = useMemo(() => createInitialParticles(), []);
  const [memoryUsage, setMemoryUsage] = useState(() => (reducedMotion ? 100 : 0));
  const [particles, setParticles] = useState<Particle[]>(initialParticles);
  const [overflow, setOverflow] = useState(() => reducedMotion);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Animate memory filling up
  useEffect(() => {
    if (reducedMotion) return;

    const interval = setInterval(() => {
      setMemoryUsage(prev => {
        if (prev >= 100) {
          setOverflow(true);
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });

      // Add more particles as memory fills
      if (memoryUsage < 100) {
        setParticles(prev => {
          if (prev.length >= 200) return prev;
          const seed = prev.length + Date.now();
          return [
            ...prev,
            {
              id: seed,
              x: seededRandom(seed) * 100,
              y: seededRandom(seed + 50) * 100,
              size: 6 + seededRandom(seed + 75) * 16,
              color: PARTICLE_COLORS[prev.length % PARTICLE_COLORS.length]!,
              velocity: {
                x: (seededRandom(seed + 100) - 0.5) * 0.3,
                y: (seededRandom(seed + 125) - 0.5) * 0.3,
              },
            },
          ];
        });
      }
    }, 80);

    return () => clearInterval(interval);
  }, [memoryUsage, reducedMotion]);

  // Animate particles
  useEffect(() => {
    if (reducedMotion) return;

    const interval = setInterval(() => {
      setParticles(prev =>
        prev.map(p => ({
          ...p,
          x: (p.x + p.velocity.x + 100) % 100,
          y: (p.y + p.velocity.y + 100) % 100,
        })),
      );
    }, 50);

    return () => clearInterval(interval);
  }, [reducedMotion]);

  return (
    <div className='fixed inset-0 overflow-x-hidden overflow-y-auto bg-linear-to-br from-[#1a1a2e] via-[#16213e] to-[#0f0f23]'>
      {/* Abstract background gradient */}
      <div
        className='pointer-events-none absolute inset-0 opacity-50'
        style={{
          background: `
            radial-gradient(circle at 20% 30%, rgba(255, 107, 107, 0.15) 0%, transparent 40%),
            radial-gradient(circle at 80% 70%, rgba(78, 205, 196, 0.15) 0%, transparent 40%),
            radial-gradient(circle at 50% 50%, rgba(69, 183, 209, 0.1) 0%, transparent 50%)
          `,
        }}
      />

      {/* Particle container */}
      <div ref={canvasRef} className='absolute inset-0'>
        {particles.map(particle => (
          <div
            key={particle.id}
            className='absolute rounded-full transition-all duration-100'
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              opacity: overflow ? 0.9 : 0.6,
              boxShadow: `0 0 ${particle.size}px ${particle.color}40`,
              transform: `translate(-50%, -50%) scale(${overflow ? 1.2 : 1})`,
            }}
          />
        ))}
      </div>

      {/* Content overlay */}
      <div className='relative flex h-full flex-col items-center justify-center p-6'>
        {/* Title */}
        <div className='mb-8 text-center'>
          <div
            className={`text-4xl font-bold tracking-wide sm:text-6xl ${overflow ? 'animate-pulse text-[#ff6b6b]' : 'text-white'}`}
            style={{
              textShadow: overflow ? '0 0 30px rgba(255, 107, 107, 0.8)' : '0 0 20px rgba(255, 255, 255, 0.3)',
            }}
          >
            OUT OF MEMORY
          </div>
          <div className='mt-2 font-mono text-sm text-white/80'>Heap allocation failed</div>
        </div>

        {/* Memory visualization */}
        <div className='mb-8 w-full max-w-md'>
          <div className='mb-2 flex justify-between font-mono text-xs'>
            <span className='text-white/80'>HEAP MEMORY</span>
            <span className={overflow ? 'text-[#ff6b6b]' : 'text-white/80'}>{memoryUsage.toFixed(0)}%</span>
          </div>

          {/* Memory bar container */}
          <div className='relative h-8 overflow-hidden rounded-lg bg-white/10'>
            {/* Gradient fill */}
            <div
              className='absolute inset-y-0 left-0 transition-all duration-200'
              style={{
                width: `${memoryUsage}%`,
                background: `linear-gradient(90deg,
                  ${memoryUsage < 50 ? '#4ecdc4' : memoryUsage < 80 ? '#ffeaa7' : '#ff6b6b'} 0%,
                  ${memoryUsage < 50 ? '#45b7d1' : memoryUsage < 80 ? '#f39c12' : '#e74c3c'} 100%
                )`,
                boxShadow: overflow ? '0 0 20px rgba(255, 107, 107, 0.5)' : 'none',
              }}
            />

            {/* Segment markers */}
            {[25, 50, 75].map(mark => (
              <div key={mark} className='absolute inset-y-0 w-px bg-white/20' style={{ left: `${mark}%` }} />
            ))}
          </div>

          {/* Memory stats */}
          <div className='mt-4 grid grid-cols-3 gap-4 font-mono text-xs'>
            <div className='text-center'>
              <div className='text-white/80'>USED</div>
              <div className='text-[#ff6b6b]'>{(memoryUsage * 2.048).toFixed(0)} MB</div>
            </div>
            <div className='text-center'>
              <div className='text-white/80'>FREE</div>
              <div className='text-[#4ecdc4]'>{((100 - memoryUsage) * 2.048).toFixed(0)} MB</div>
            </div>
            <div className='text-center'>
              <div className='text-white/80'>OBJECTS</div>
              <div className='text-white/80'>{particles.length}</div>
            </div>
          </div>
        </div>

        {/* Error message */}
        {overflow && (
          <div className='mb-8 animate-pulse rounded-lg border border-[#ff6b6b]/30 bg-[#ff6b6b]/10 px-6 py-3'>
            <div className='font-mono text-sm text-[#ff6b6b]'>FATAL ERROR: Allocation failed - JavaScript heap out of memory</div>
          </div>
        )}

        {/* Fix action */}
        <Link
          to='/'
          className='inline-flex items-center gap-3 rounded-lg border border-white/20 bg-white/5 px-6 py-3 font-mono text-sm text-white backdrop-blur transition-all hover:border-white/40 hover:bg-white/10'
        >
          <span className='text-[#4ecdc4]'>♻</span>
          メモリを解放 → ホームへ戻る
        </Link>
      </div>
    </div>
  );
};

export default OutOfMemory;
