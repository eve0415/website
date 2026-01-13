import type { MouseInfluence } from '../useMouseInfluence';
import type { FC } from 'react';

import { useMemo } from 'react';

import ErrorCascade from './ErrorCascade/error-cascade';
import { useCorruptionEffects } from './useCorruptionEffects';

interface CorruptionOverlayProps {
  progress: number;
  mouseInfluence: MouseInfluence;
  visible: boolean;
}

// Seeded random for deterministic values based on index
const seededRandom = (seed: number): number => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

const CorruptionOverlay: FC<CorruptionOverlayProps> = ({ progress, mouseInfluence, visible }) => {
  const { intensity, glitchLines, staticOpacity, scanlineOffset } = useCorruptionEffects({
    enabled: visible,
    progress,
  });

  // Pre-generate edge distortion bar data (deterministic based on progress bucket)
  const edgeBars = useMemo(() => {
    const seed = Math.floor(progress * 10); // Changes when progress crosses 0.1 boundaries
    return Array.from({ length: 20 }).map((_, i) => ({
      color: seededRandom(seed * 100 + i) > 0.5 ? '#00d4ff' : '#ff6b35',
      opacity: seededRandom(seed * 100 + i + 50),
    }));
  }, [progress]);

  if (!visible) return null;

  return (
    <div className='pointer-events-none fixed inset-0 z-20 overflow-hidden'>
      {/* Static noise overlay */}
      <div
        className='absolute inset-0 opacity-0 mix-blend-overlay'
        style={{
          opacity: staticOpacity,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Scanline effect */}
      <div
        className='absolute inset-0 opacity-20'
        style={{
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 212, 255, 0.03) 2px,
            rgba(0, 212, 255, 0.03) 4px
          )`,
          transform: `translateY(${scanlineOffset}%)`,
        }}
      />

      {/* Glitch lines */}
      {glitchLines.map(line => (
        <div
          key={line.id}
          className='bg-cyan absolute h-1 mix-blend-screen'
          style={{
            top: `${line.y}%`,
            left: `${50 - line.width / 2 + line.offset}%`,
            width: `${line.width}%`,
            opacity: line.opacity * intensity,
            transform: `translateX(${line.jitter}px)`,
          }}
        />
      ))}

      {/* Mouse disruption zone */}
      {mouseInfluence.disruptionRadius > 0 && (
        <div
          className='absolute rounded-full mix-blend-screen'
          style={{
            left: mouseInfluence.position.x - mouseInfluence.disruptionRadius,
            top: mouseInfluence.position.y - mouseInfluence.disruptionRadius,
            width: mouseInfluence.disruptionRadius * 2,
            height: mouseInfluence.disruptionRadius * 2,
            background: `radial-gradient(circle, rgba(255, 107, 53, ${intensity * 0.3}) 0%, transparent 70%)`,
          }}
        />
      )}

      {/* Chromatic aberration layers */}
      <div
        className='absolute inset-0 mix-blend-screen'
        style={{
          opacity: intensity * 0.3,
          background: `linear-gradient(${90 + progress * 180}deg, rgba(255, 0, 0, 0.1) 0%, transparent 50%, rgba(0, 255, 255, 0.1) 100%)`,
          transform: `translate(${intensity * 4}px, ${intensity * -2}px)`,
        }}
      />

      {/* Cascading error messages with stack traces */}
      <ErrorCascade progress={progress} enabled={visible} />

      {/* Corner glitch artifacts */}
      {intensity > 0.5 && (
        <>
          <div
            className='from-cyan/20 absolute top-0 left-0 h-20 w-40 bg-linear-to-br to-transparent'
            style={{
              clipPath: 'polygon(0 0, 100% 0, 70% 100%, 0 60%)',
              opacity: (intensity - 0.5) * 2,
            }}
          />
          <div
            className='from-orange/20 absolute right-0 bottom-0 h-32 w-48 bg-linear-to-tl to-transparent'
            style={{
              clipPath: 'polygon(30% 0, 100% 40%, 100% 100%, 0 100%)',
              opacity: (intensity - 0.5) * 2,
            }}
          />
        </>
      )}

      {/* Edge distortion bars */}
      {intensity > 0.7 && (
        <div className='absolute inset-x-0 top-0 flex h-2 opacity-60'>
          {edgeBars.map((bar, i) => (
            <div
              key={i}
              className='h-full flex-1'
              style={{
                backgroundColor: bar.color,
                opacity: bar.opacity,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CorruptionOverlay;
