import type { ContributionDay } from '../../-utils/github-stats-utils';
import type { FC } from 'react';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useReducedMotion } from '#hooks/useReducedMotion';

// Colors from design system - moved outside component to prevent recreation
const COLORS = {
  bg: '#0a0a0a',
  gridLine: 'rgba(255, 255, 255, 0.03)',
  scanLine: '#00ff88',
  scanGlow: 'rgba(0, 255, 136, 0.3)',
  level0: 'rgba(255, 255, 255, 0.02)',
  level1: 'rgba(0, 255, 136, 0.2)',
  level2: 'rgba(0, 255, 136, 0.4)',
  level3: 'rgba(0, 255, 136, 0.6)',
  level4: 'rgba(0, 255, 136, 0.9)',
  center: '#00ff88',
  text: 'rgba(255, 255, 255, 0.5)',
} as const;

const DAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'] as const;

function getLevelColor(level: 0 | 1 | 2 | 3 | 4): string {
  switch (level) {
    case 0:
      return COLORS.level0;
    case 1:
      return COLORS.level1;
    case 2:
      return COLORS.level2;
    case 3:
      return COLORS.level3;
    case 4:
      return COLORS.level4;
    default:
      return COLORS.level0;
  }
}

interface CodeRadarProps {
  contributionCalendar: ContributionDay[];
  onBootComplete?: () => void;
}

const CodeRadar: FC<CodeRadarProps> = ({ contributionCalendar, onBootComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [bootPhase, setBootPhase] = useState<'booting' | 'idle'>(prefersReducedMotion ? 'idle' : 'booting');
  const bootProgressRef = useRef(0);
  const animationRef = useRef<number>(0);
  const bootCompleteCalledRef = useRef(false);

  const totalContributions = useMemo(() => {
    return contributionCalendar.reduce((sum, day) => sum + day.count, 0);
  }, [contributionCalendar]);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number, time: number, skipAnimation: boolean) => {
      const centerX = width / 2;
      const centerY = height / 2;
      const maxRadius = Math.min(width, height) / 2 - 20;

      // Clear canvas
      ctx.fillStyle = COLORS.bg;
      ctx.fillRect(0, 0, width, height);

      // Get last 52 weeks of data (most recent at outer ring)
      const weeks: ContributionDay[][] = [];
      for (let i = 0; i < contributionCalendar.length; i += 7) {
        weeks.push(contributionCalendar.slice(i, i + 7));
      }
      const last52Weeks = weeks.slice(-52);

      // Calculate ring dimensions
      const innerRadius = maxRadius * 0.15;
      const ringWidth = (maxRadius - innerRadius) / 52;

      // Draw contribution rings
      for (let weekIndex = 0; weekIndex < last52Weeks.length; weekIndex++) {
        const week = last52Weeks[weekIndex];
        if (!week) continue;

        const ringRadius = innerRadius + ringWidth * (weekIndex + 0.5);

        // During boot, only show rings up to boot progress
        if (bootPhase === 'booting' && weekIndex > bootProgressRef.current * 52) {
          continue;
        }

        for (let dayIndex = 0; dayIndex < week.length; dayIndex++) {
          const day = week[dayIndex];
          if (!day) continue;

          const startAngle = (dayIndex / 7) * Math.PI * 2 - Math.PI / 2;
          const endAngle = ((dayIndex + 1) / 7) * Math.PI * 2 - Math.PI / 2;

          ctx.beginPath();
          ctx.arc(centerX, centerY, ringRadius + ringWidth / 2, startAngle, endAngle);
          ctx.arc(centerX, centerY, ringRadius - ringWidth / 2, endAngle, startAngle, true);
          ctx.closePath();

          ctx.fillStyle = getLevelColor(day.level);
          ctx.fill();
        }
      }

      // Draw grid lines (circles)
      ctx.strokeStyle = COLORS.gridLine;
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const radius = innerRadius + ((maxRadius - innerRadius) * i) / 4;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw radial lines
      for (let i = 0; i < 7; i++) {
        const angle = (i / 7) * Math.PI * 2 - Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(centerX + Math.cos(angle) * innerRadius, centerY + Math.sin(angle) * innerRadius);
        ctx.lineTo(centerX + Math.cos(angle) * maxRadius, centerY + Math.sin(angle) * maxRadius);
        ctx.stroke();
      }

      // Draw scanning line during boot or subtle pulse during idle
      if (bootPhase === 'booting') {
        const scanAngle = bootProgressRef.current * Math.PI * 2 - Math.PI / 2;

        // Scan line glow
        const gradient = ctx.createLinearGradient(centerX, centerY, centerX + Math.cos(scanAngle) * maxRadius, centerY + Math.sin(scanAngle) * maxRadius);
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(0.5, COLORS.scanGlow);
        gradient.addColorStop(1, COLORS.scanLine);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + Math.cos(scanAngle) * maxRadius, centerY + Math.sin(scanAngle) * maxRadius);
        ctx.stroke();

        // Scan arc glow
        ctx.strokeStyle = COLORS.scanGlow;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(centerX, centerY, maxRadius * 0.8, scanAngle - 0.3, scanAngle);
        ctx.stroke();
      } else if (!skipAnimation) {
        // Idle: subtle pulse from center (skipped when reduced motion is enabled)
        const pulseRadius = innerRadius + Math.sin(time * 0.002) * 10;
        const pulseAlpha = 0.3 + Math.sin(time * 0.002) * 0.1;

        ctx.strokeStyle = `rgba(0, 255, 136, ${pulseAlpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw center dot
      ctx.fillStyle = COLORS.center;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
      ctx.fill();

      // Center glow
      const centerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, innerRadius * 0.8);
      centerGradient.addColorStop(0, 'rgba(0, 255, 136, 0.15)');
      centerGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = centerGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, innerRadius * 0.8, 0, Math.PI * 2);
      ctx.fill();

      // Day labels
      ctx.fillStyle = COLORS.text;
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (let i = 0; i < DAY_LABELS.length; i++) {
        const label = DAY_LABELS[i] as string;
        const angle = (i / 7) * Math.PI * 2 - Math.PI / 2;
        const labelRadius = maxRadius + 15;
        const x = centerX + Math.cos(angle) * labelRadius;
        const y = centerY + Math.sin(angle) * labelRadius;
        ctx.fillText(label, x, y);
      }
    },
    [bootPhase, contributionCalendar],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setupCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return rect;
    };

    let rect = setupCanvas();
    let startTime: number | null = null;
    const bootDuration = 2000; // 2 seconds boot animation

    const animate = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const elapsed = timestamp - startTime;

      if (bootPhase === 'booting') {
        bootProgressRef.current = Math.min(elapsed / bootDuration, 1);

        if (bootProgressRef.current >= 1) {
          setBootPhase('idle');
          if (!bootCompleteCalledRef.current) {
            bootCompleteCalledRef.current = true;
            onBootComplete?.();
          }
        }
      }

      draw(ctx, rect.width, rect.height, timestamp, false);
      animationRef.current = requestAnimationFrame(animate);
    };

    // For reduced motion, just draw once
    if (prefersReducedMotion) {
      bootProgressRef.current = 1;
      draw(ctx, rect.width, rect.height, 0, true);
      if (!bootCompleteCalledRef.current) {
        bootCompleteCalledRef.current = true;
        onBootComplete?.();
      }
    } else {
      animationRef.current = requestAnimationFrame(animate);
    }

    // Handle viewport/resize changes
    const resizeObserver = new ResizeObserver(() => {
      rect = setupCanvas();
      if (prefersReducedMotion) {
        draw(ctx, rect.width, rect.height, 0, true);
      }
    });
    resizeObserver.observe(canvas);

    return () => {
      cancelAnimationFrame(animationRef.current);
      resizeObserver.disconnect();
    };
  }, [draw, bootPhase, prefersReducedMotion, onBootComplete]);

  // Intersection observer to trigger animation only when visible
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || prefersReducedMotion) return;

    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        if (entry?.isIntersecting && bootPhase === 'booting') {
          // Animation will auto-start via useEffect
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(canvas);
    return () => observer.disconnect();
  }, [bootPhase, prefersReducedMotion]);

  return (
    <div className='relative w-full max-w-md'>
      {/* ASCII border decoration */}
      <div className='mb-2 font-mono text-subtle-foreground text-xs'>
        <span className='text-neon'>[</span>
        <span>CODE_RADAR</span>
        <span className='text-neon'>]</span>
        <span className='ml-2 text-subtle-foreground'>// 52週間の活動</span>
      </div>

      <div className='relative aspect-square w-full rounded border border-line bg-surface/50'>
        <canvas
          ref={canvasRef}
          role='img'
          aria-label={`Contribution radar: ${totalContributions.toLocaleString()} total contributions across 52 weeks`}
          className='h-full w-full'
          style={{ width: '100%', height: '100%' }}
        />

        {/* Boot status overlay */}
        {bootPhase === 'booting' && !prefersReducedMotion && (
          <div className='pointer-events-none absolute inset-0 flex items-end justify-center pb-4'>
            <span className='animate-pulse font-mono text-neon text-xs'>SCANNING...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeRadar;
