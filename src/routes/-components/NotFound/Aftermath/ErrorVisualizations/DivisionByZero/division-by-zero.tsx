import type { FC } from 'react';

import { Link } from '@tanstack/react-router';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useReducedMotion } from '#hooks/useReducedMotion';

interface FloatingNumber {
  id: number;
  value: string;
  x: number;
  y: number;
  angle: number;
  distance: number;
  speed: number;
}

// Black hole visualization for division by zero
const DivisionByZero: FC = () => {
  const reducedMotion = useReducedMotion();

  const [collapsed, setCollapsed] = useState(() => reducedMotion);
  const [pullStrength, setPullStrength] = useState(() => (reducedMotion ? 1 : 0));
  const [rotation, setRotation] = useState(0);

  // Seeded random for deterministic values
  const seededRandom = (seed: number): number => {
    const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
    return x - Math.floor(x);
  };

  // Floating numbers that get sucked in
  const numbers = useMemo((): FloatingNumber[] => {
    const result: FloatingNumber[] = [];
    const symbols = ['1', '2', '3', '4', '5', '404', 'π', 'e', '∞', '42', '0', 'NaN'];
    for (let i = 0; i < 24; i++) {
      result.push({
        id: i,
        value: symbols[i % symbols.length]!,
        x: 50 + Math.cos((i / 24) * Math.PI * 2) * 40,
        y: 50 + Math.sin((i / 24) * Math.PI * 2) * 40,
        angle: (i / 24) * Math.PI * 2,
        distance: 30 + seededRandom(i) * 20,
        speed: 0.5 + seededRandom(i + 100) * 0.5,
      });
    }
    return result;
  }, []);

  const pullRef = useRef(0);

  // Animate pull towards center
  useEffect(() => {
    if (reducedMotion) return;

    pullRef.current = 0;
    const interval = setInterval(() => {
      if (pullRef.current < 1) {
        pullRef.current += 0.02;
        setPullStrength(pullRef.current);
      } else {
        setCollapsed(true);
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [reducedMotion]);

  // Rotation animation
  useEffect(() => {
    if (reducedMotion) return;

    const interval = setInterval(() => {
      setRotation(r => r + 2);
    }, 30);

    return () => clearInterval(interval);
  }, [reducedMotion]);

  const getNumberPosition = (num: FloatingNumber) => {
    const currentDistance = num.distance * (1 - pullStrength * 0.9);
    const currentAngle = num.angle + (rotation * num.speed * Math.PI) / 180;
    return {
      x: 50 + Math.cos(currentAngle) * currentDistance,
      y: 50 + Math.sin(currentAngle) * currentDistance,
      scale: 1 - pullStrength * 0.7,
      opacity: 1 - pullStrength * 0.5,
    };
  };

  return (
    <div className='bg-background fixed inset-0 overflow-x-hidden overflow-y-auto'>
      {/* Header */}
      <div className='bg-background flex h-9 items-center border-b border-[#9c27b0]/30 px-4'>
        <span className='font-mono text-xs text-[#9c27b0]'>Python 3.12.0 - ZeroDivisionError</span>
      </div>

      <div className='flex h-[calc(100%-2.25rem)] flex-col bg-[#050505] md:flex-row'>
        {/* Black hole visualization */}
        <div className='relative h-1/2 flex-1 md:h-auto'>
          {/* Number line background */}
          <div className='absolute inset-x-0 top-1/2 h-px bg-[#333]/50' />
          <div className='absolute inset-y-0 left-1/2 w-px bg-[#333]/50' />

          {/* Floating numbers */}
          {numbers.map(num => {
            const pos = getNumberPosition(num);
            return (
              <div
                key={num.id}
                className='absolute -translate-x-1/2 -translate-y-1/2 font-mono text-lg transition-all'
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  transform: `translate(-50%, -50%) scale(${pos.scale})`,
                  opacity: pos.opacity,
                  color: num.value === '0' ? '#ff4444' : '#9c27b0',
                }}
              >
                {num.value}
              </div>
            );
          })}

          {/* Central black hole */}
          <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
            {/* Event horizon */}
            <div
              className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black'
              style={{
                width: `${50 + pullStrength * 100}px`,
                height: `${50 + pullStrength * 100}px`,
                boxShadow: `0 0 ${30 + pullStrength * 50}px ${10 + pullStrength * 20}px rgba(156, 39, 176, 0.5)`,
              }}
            />

            {/* Division symbol */}
            <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center font-mono'>
              <div className='text-4xl text-white'>÷</div>
              <div className='text-6xl font-bold text-[#ff4444]'>0</div>
            </div>
          </div>

          {/* Infinity symbol emerging */}
          {collapsed && (
            <div
              className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-8xl text-[#9c27b0]'
              style={{
                animation: 'pulse 1s infinite',
                textShadow: '0 0 30px rgba(156, 39, 176, 0.8)',
              }}
            >
              ∞
            </div>
          )}
        </div>

        {/* Error panel */}
        <div className='bg-background h-1/2 w-full overflow-y-auto border-t border-[#333] p-4 md:h-auto md:w-80 md:border-t-0 md:border-l md:p-6'>
          <div className='mb-4 font-mono text-xs text-[#666]'>Traceback (most recent call last):</div>

          <div className='space-y-2 font-mono text-xs'>
            <div className='text-[#888]'>File "math.py", line 404, in calculate</div>
            <div className='pl-4 text-[#d4d4d4]'>result = page_count / divisor</div>
          </div>

          <div className='mt-4 rounded border border-[#ff4444]/50 bg-[#ff4444]/10 p-3'>
            <div className='font-mono text-sm text-[#ff4444]'>ZeroDivisionError: division by zero</div>
          </div>

          <div className='mt-8 space-y-2'>
            <div className='font-mono text-xs text-[#666]'>Mathematical explanation:</div>
            <div className='rounded bg-[#111] p-3 font-mono text-xs'>
              <div className='text-[#9c27b0]'>lim(x→0⁺) 1/x = +∞</div>
              <div className='mt-1 text-[#9c27b0]'>lim(x→0⁻) 1/x = -∞</div>
              <div className='mt-2 text-[#ff4444]'>1/0 = undefined</div>
            </div>
          </div>

          {collapsed && (
            <div className='mt-6 text-center'>
              <div className='font-mono text-xs text-[#888]'>The answer lies...</div>
              <div className='mt-2 font-mono text-2xl text-[#9c27b0]'>beyond infinity</div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className='absolute inset-x-0 bottom-8 text-center'>
        <Link
          to='/'
          className='inline-flex items-center gap-2 rounded bg-[#9c27b0]/20 px-6 py-3 font-mono text-sm text-[#9c27b0] transition-all hover:bg-[#9c27b0]/30'
        >
          ゼロを回避 → ホームへ戻る
        </Link>
      </div>
    </div>
  );
};

export default DivisionByZero;
