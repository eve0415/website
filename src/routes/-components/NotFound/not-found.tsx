import type { FC } from 'react';

import { useCallback } from 'react';

import { useReducedMotion } from '#hooks/useReducedMotion';

import AftermathScene from './Aftermath/aftermath-scene';
import BootSequence from './BootSequence/boot-sequence';
import CorruptionOverlay from './Corruption/corruption-overlay';
import { useMouseInfluence } from './useMouseInfluence';
import { usePhaseController } from './usePhaseController';

const NotFound: FC = () => {
  const reducedMotion = useReducedMotion();

  const {
    current: phase,
    progress,
    elapsed,
    isPhase,
  } = usePhaseController({
    skipToAftermath: reducedMotion,
    onPhaseChange: useCallback((newPhase: string) => {
      // Could add analytics or effects here
      console.log(`[NOT_FOUND] Phase transition: ${newPhase}`);
    }, []),
  });

  const mouseInfluence = useMouseInfluence({
    phase,
    enabled: !reducedMotion,
  });

  return (
    <main role='main' aria-label='ページが見つかりません' className='relative min-h-screen overflow-hidden bg-background'>
      {/* Screen reader content */}
      <div className='sr-only'>ページが見つかりません。ホームに戻るにはページ下部のリンクをクリックしてください。</div>

      {/* Phase 1: Boot Sequence */}
      <BootSequence
        elapsed={elapsed}
        progress={progress}
        mouseInfluence={mouseInfluence}
        visible={isPhase('boot') || (isPhase('corruption') && progress < 0.3)}
      />

      {/* Phase 2: Corruption Overlay */}
      <CorruptionOverlay progress={progress} mouseInfluence={mouseInfluence} visible={isPhase('corruption')} />

      {/* Phase 3: Aftermath Scene - Educational error visualizations */}
      <AftermathScene visible={isPhase('aftermath')} />

      {/* Static aftermath for reduced motion */}
      {reducedMotion && <StaticAftermath />}
    </main>
  );
};

// Static version for reduced motion preference
const StaticAftermath: FC = () => {
  return (
    <div className='fixed inset-0 flex flex-col items-center justify-center bg-background'>
      {/* Static glow effect */}
      <div
        className='absolute top-1/2 left-1/2 size-32 -translate-x-1/2 -translate-y-1/2 rounded-full'
        style={{
          background: 'radial-gradient(circle, rgba(0, 212, 255, 0.2) 0%, transparent 70%)',
        }}
      />

      {/* 404 text */}
      <div className='relative z-10 mb-8 font-bold font-mono text-8xl text-foreground/30 tracking-tight'>404</div>

      {/* Message */}
      <div className='relative z-10 text-center'>
        <div className='text-muted-foreground text-xs uppercase tracking-widest'>[ERROR_CONTAINED]</div>
        <div className='mt-2 text-foreground/60 text-sm'>次元境界に異常が発生しました</div>
      </div>

      {/* Home link */}
      <a
        href='/'
        className='relative z-10 mt-8 flex items-center gap-3 rounded-lg border border-line/50 bg-surface/80 px-5 py-3 transition-all duration-300 hover:border-cyan/50 hover:shadow-[0_0_20px_rgba(0,212,255,0.2)]'
      >
        <div className='size-3 rounded-full bg-neon' style={{ boxShadow: '0 0 8px rgba(0, 255, 136, 0.5)' }} />
        <span className='text-foreground text-sm'>ホームに戻る</span>
        <svg className='size-4 text-muted-foreground' fill='none' stroke='currentColor' viewBox='0 0 24 24' aria-hidden='true'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 8l4 4m0 0l-4 4m4-4H3' />
        </svg>
      </a>
    </div>
  );
};

export default NotFound;
