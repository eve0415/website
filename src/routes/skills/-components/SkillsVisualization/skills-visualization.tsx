import type { FC } from 'react';

import { useEffect, useRef } from 'react';

import { useReducedMotion } from '#hooks/useReducedMotion';

import { levelConfig, skills } from '../../-config/skills-config';

interface Props {
  animate?: boolean;
}

const SkillsVisualization: FC<Props> = ({ animate = true }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = animate && !prefersReducedMotion;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId = 0;
    let time = 0;

    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;

      // Size canvas for high DPI
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Create nodes for each skill based on current canvas size
      const nodes = skills.map((skill, i) => {
        const angle = (i / skills.length) * Math.PI * 2;
        const radiusBase = Math.min(width, height) * 0.35;
        const categoryOffset = skill.category === 'language' ? 0 : skill.category === 'infrastructure' ? 0.1 : 0.2;
        const levelOffset = skill.level === 'expert' ? 0 : skill.level === 'proficient' ? 0.15 : 0.3;
        const radius = radiusBase * (0.8 + categoryOffset - levelOffset);

        return {
          x: width / 2 + Math.cos(angle) * radius,
          y: height / 2 + Math.sin(angle) * radius,
          skill,
        };
      });

      ctx.clearRect(0, 0, width, height);

      if (shouldAnimate) {
        time += 0.01;
      }

      // Draw connections between same-category skills
      ctx.strokeStyle = 'rgba(64, 64, 64, 0.2)';
      ctx.lineWidth = 1;

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const nodeA = nodes[i];
          const nodeB = nodes[j];
          if (nodeA && nodeB && nodeA.skill.category === nodeB.skill.category) {
            const floatAX = shouldAnimate ? Math.sin(time + nodeA.x * 0.01) * 2 : 0;
            const floatAY = shouldAnimate ? Math.cos(time + nodeA.y * 0.01) * 2 : 0;
            const floatBX = shouldAnimate ? Math.sin(time + nodeB.x * 0.01) * 2 : 0;
            const floatBY = shouldAnimate ? Math.cos(time + nodeB.y * 0.01) * 2 : 0;

            ctx.beginPath();
            ctx.moveTo(nodeA.x + floatAX, nodeA.y + floatAY);
            ctx.lineTo(nodeB.x + floatBX, nodeB.y + floatBY);
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (const node of nodes) {
        // Subtle floating animation (disabled when shouldAnimate is false)
        const floatX = shouldAnimate ? Math.sin(time + node.x * 0.01) * 2 : 0;
        const floatY = shouldAnimate ? Math.cos(time + node.y * 0.01) * 2 : 0;

        const config = levelConfig[node.skill.level];
        const baseRadius = node.skill.level === 'expert' ? 8 : node.skill.level === 'proficient' ? 6 : 4;

        // Node
        const colors: Record<string, string> = {
          neon: '#00ff88',
          cyan: '#00d4ff',
          orange: '#ff6b35',
        };
        ctx.fillStyle = colors[config.color] || '#00ff88';
        ctx.beginPath();
        ctx.arc(node.x + floatX, node.y + floatY, baseRadius, 0, Math.PI * 2);
        ctx.fill();

        // Label for expert skills
        if (node.skill.level === 'expert') {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.font = '10px JetBrains Mono, monospace';
          ctx.textAlign = 'center';
          ctx.fillText(node.skill.name, node.x + floatX, node.y + floatY + 18);
        }
      }

      if (shouldAnimate) {
        animationId = requestAnimationFrame(draw);
      }
    };

    // Initial draw
    draw();

    // Use ResizeObserver to handle viewport changes
    const resizeObserver = new ResizeObserver(() => {
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
    <div className='relative h-100 rounded-lg border border-line bg-surface/30'>
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
            <span key={level} className='flex items-center gap-1.5 text-subtle-foreground text-xs'>
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
