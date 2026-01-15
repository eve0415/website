import type { Skill } from '../../-config/skills-config';
import type { FC } from 'react';

import { useEffect, useRef, useState } from 'react';

import { useReducedMotion } from '#hooks/useReducedMotion';

import { levelConfig, skills } from '../../-config/skills-config';

// Precompute node metadata that doesn't depend on canvas size
interface NodeMetadata {
  skill: Skill;
  angle: number;
  categoryOffset: number;
  levelOffset: number;
  baseRadius: number;
  color: string;
  showLabel: boolean;
}

// Precompute connections between same-category skills (O(n²) done once)
interface Connection {
  indexA: number;
  indexB: number;
}

// Static computations done once at module load
const nodeMetadata: NodeMetadata[] = skills.map((skill, i) => {
  const colors: Record<string, string> = {
    neon: '#00ff88',
    cyan: '#00d4ff',
    orange: '#ff6b35',
  };
  const config = levelConfig[skill.level];

  return {
    skill,
    angle: (i / skills.length) * Math.PI * 2,
    categoryOffset: skill.category === 'language' ? 0 : skill.category === 'infrastructure' ? 0.1 : 0.2,
    levelOffset: skill.level === 'expert' ? 0 : skill.level === 'proficient' ? 0.15 : 0.3,
    baseRadius: skill.level === 'expert' ? 8 : skill.level === 'proficient' ? 6 : 4,
    color: colors[config.color] || '#00ff88',
    showLabel: skill.level === 'expert',
  };
});

const connections: Connection[] = [];
for (let i = 0; i < skills.length; i++) {
  for (let j = i + 1; j < skills.length; j++) {
    const skillA = skills[i];
    const skillB = skills[j];
    if (skillA && skillB && skillA.category === skillB.category) {
      connections.push({ indexA: i, indexB: j });
    }
  }
}

interface Props {
  animate?: boolean;
}

const SkillsVisualization: FC<Props> = ({ animate = true }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = animate && !prefersReducedMotion;

  // Track canvas dimensions to recalculate node positions on resize
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Cache computed node positions (only recalculated when dimensions change)
  const nodesRef = useRef<Array<{ x: number; y: number; meta: NodeMetadata }>>([]);

  // Recompute node positions when dimensions change
  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;

    const { width, height } = dimensions;
    const radiusBase = Math.min(width, height) * 0.35;

    nodesRef.current = nodeMetadata.map(meta => {
      const radius = radiusBase * (0.8 + meta.categoryOffset - meta.levelOffset);
      return {
        x: width / 2 + Math.cos(meta.angle) * radius,
        y: height / 2 + Math.sin(meta.angle) * radius,
        meta,
      };
    });
  }, [dimensions]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId = 0;
    let time = 0;

    const setupCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      return { width, height };
    };

    const draw = () => {
      const { width, height } = setupCanvas();
      ctx.clearRect(0, 0, width, height);

      if (shouldAnimate) {
        time += 0.01;
      }

      const nodes = nodesRef.current;
      if (nodes.length === 0) {
        // First frame - nodes not yet computed
        if (shouldAnimate) {
          animationId = requestAnimationFrame(draw);
        }
        return;
      }

      // Draw connections (using precomputed connection pairs)
      ctx.strokeStyle = 'rgba(64, 64, 64, 0.2)';
      ctx.lineWidth = 1;

      for (const { indexA, indexB } of connections) {
        const nodeA = nodes[indexA];
        const nodeB = nodes[indexB];
        if (!nodeA || !nodeB) continue;

        const floatAX = shouldAnimate ? Math.sin(time + nodeA.x * 0.01) * 2 : 0;
        const floatAY = shouldAnimate ? Math.cos(time + nodeA.y * 0.01) * 2 : 0;
        const floatBX = shouldAnimate ? Math.sin(time + nodeB.x * 0.01) * 2 : 0;
        const floatBY = shouldAnimate ? Math.cos(time + nodeB.y * 0.01) * 2 : 0;

        ctx.beginPath();
        ctx.moveTo(nodeA.x + floatAX, nodeA.y + floatAY);
        ctx.lineTo(nodeB.x + floatBX, nodeB.y + floatBY);
        ctx.stroke();
      }

      // Draw nodes
      for (const node of nodes) {
        const floatX = shouldAnimate ? Math.sin(time + node.x * 0.01) * 2 : 0;
        const floatY = shouldAnimate ? Math.cos(time + node.y * 0.01) * 2 : 0;

        ctx.fillStyle = node.meta.color;
        ctx.beginPath();
        ctx.arc(node.x + floatX, node.y + floatY, node.meta.baseRadius, 0, Math.PI * 2);
        ctx.fill();

        if (node.meta.showLabel) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.font = '10px JetBrains Mono, monospace';
          ctx.textAlign = 'center';
          ctx.fillText(node.meta.skill.name, node.x + floatX, node.y + floatY + 18);
        }
      }

      if (shouldAnimate) {
        animationId = requestAnimationFrame(draw);
      }
    };

    // Set initial dimensions
    const { width, height } = setupCanvas();
    setDimensions({ width, height });

    // Initial draw
    draw();

    // Use ResizeObserver to handle viewport changes and dimension updates
    const resizeObserver = new ResizeObserver(entries => {
      const entry = entries[0];
      if (entry) {
        const rect = entry.contentRect;
        setDimensions({ width: rect.width, height: rect.height });
      }
      cancelAnimationFrame(animationId);
      draw();
    });
    resizeObserver.observe(canvas);

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationId);
    };
  }, [shouldAnimate]);

  return (
    <div className='border-line bg-surface/30 relative h-100 rounded-lg border'>
      <canvas ref={canvasRef} className='size-full' />
      {/* Legend overlay */}
      <div className='pointer-events-none absolute bottom-4 left-4 flex flex-wrap gap-3'>
        {Object.entries(levelConfig).map(([level, config]) => {
          const colors: Record<string, string> = {
            neon: 'bg-neon',
            cyan: 'bg-cyan',
            orange: 'bg-orange',
          };
          return (
            <span key={level} className='text-subtle-foreground flex items-center gap-1.5 text-xs'>
              <span className={`size-2 rounded-full ${colors[config.color]}`} />
              <span>{config.label}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default SkillsVisualization;
