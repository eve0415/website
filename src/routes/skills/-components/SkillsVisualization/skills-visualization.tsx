import type { AISkill } from '#workflows/-utils/ai-skills-types';
import type { Skill } from '../../-config/skills-config';
import type { MaterializePhase } from './useNodeMaterialize';
import type { FC } from 'react';

import { useCallback, useEffect, useRef, useState } from 'react';

import { useReducedMotion } from '#hooks/useReducedMotion';

import { levelConfig, skills as staticSkills } from '../../-config/skills-config';

import { getMaterializeDrawParams, useNodeMaterialize } from './useNodeMaterialize';

// Node types for unified handling
interface BaseNode {
  x: number;
  y: number;
  radius: number;
  color: string;
  label: string;
  showLabel: boolean;
  isAI: boolean;
}

interface StaticNode extends BaseNode {
  isAI: false;
  skill: Skill;
}

interface AINode extends BaseNode {
  isAI: true;
  aiSkill: AISkill;
  materializePhase: MaterializePhase;
  materializeProgress: number;
}

type VisualizationNode = StaticNode | AINode;

// Connection between nodes
interface Connection {
  fromIndex: number;
  toIndex: number;
}

// Colors
const COLORS = {
  neon: '#00ff88',
  cyan: '#00d4ff',
  orange: '#ff6b35',
  fuchsia: '#d946ef',
  fuchsiaBright: '#ec4899',
};

interface Props {
  animate?: boolean;
  aiSkills?: AISkill[];
  selectedSkillId?: string | null;
  onNodeSelect?: (skillName: string | null) => void;
}

// Component for individual AI node materialize state
const AINodeMaterializeTracker: FC<{
  skill: AISkill;
  index: number;
  onStateChange: (index: number, phase: MaterializePhase, progress: number) => void;
}> = ({ skill, index, onStateChange }) => {
  const { phase, progress } = useNodeMaterialize({
    shouldAnimate: skill.is_ai_discovered,
    delay: index * 200, // Stagger animations
  });

  useEffect(() => {
    onStateChange(index, phase, progress);
  }, [index, phase, progress, onStateChange]);

  return null;
};

const SkillsVisualization: FC<Props> = ({ animate = true, aiSkills = [], selectedSkillId = null, onNodeSelect }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = animate && !prefersReducedMotion;

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Track AI node materialize states
  const [aiMaterializeStates, setAIMaterializeStates] = useState<Map<number, { phase: MaterializePhase; progress: number }>>(new Map());

  const handleMaterializeChange = useCallback((index: number, phase: MaterializePhase, progress: number) => {
    setAIMaterializeStates(prev => {
      const next = new Map(prev);
      next.set(index, { phase, progress });
      return next;
    });
  }, []);

  // Compute nodes from static skills + AI skills
  const nodesRef = useRef<VisualizationNode[]>([]);
  const connectionsRef = useRef<Connection[]>([]);

  // Recompute nodes when dimensions or skills change
  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;

    const { width, height } = dimensions;
    const radiusBase = Math.min(width, height) * 0.35;
    const centerX = width / 2;
    const centerY = height / 2;

    const allNodes: VisualizationNode[] = [];

    // Static skills (existing behavior)
    staticSkills.forEach((skill, i) => {
      const config = levelConfig[skill.level];
      const angle = (i / staticSkills.length) * Math.PI * 2;
      const categoryOffset = skill.category === 'language' ? 0 : skill.category === 'infrastructure' ? 0.1 : 0.2;
      const levelOffset = skill.level === 'expert' ? 0 : skill.level === 'proficient' ? 0.15 : 0.3;
      const radius = radiusBase * (0.8 + categoryOffset - levelOffset);

      allNodes.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        radius: skill.level === 'expert' ? 8 : skill.level === 'proficient' ? 6 : 4,
        color: COLORS[config.color as keyof typeof COLORS] || COLORS.neon,
        label: skill.name,
        showLabel: skill.level === 'expert',
        isAI: false,
        skill,
      });
    });

    // AI-discovered skills (positioned in outer ring)
    const aiOnlySkills = aiSkills.filter(s => s.is_ai_discovered);
    aiOnlySkills.forEach((aiSkill, i) => {
      const angle = (i / Math.max(aiOnlySkills.length, 1)) * Math.PI * 2 + Math.PI / 4;
      const radius = radiusBase * 1.1;

      const materializeState = aiMaterializeStates.get(i) || { phase: 'hidden' as MaterializePhase, progress: 0 };

      allNodes.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        radius: 7,
        color: COLORS.fuchsia,
        label: aiSkill.name,
        showLabel: materializeState.phase === 'visible',
        isAI: true,
        aiSkill,
        materializePhase: materializeState.phase,
        materializeProgress: materializeState.progress,
      });
    });

    nodesRef.current = allNodes;

    // Compute connections (same category for static, AI connects to related static)
    const connections: Connection[] = [];
    for (let i = 0; i < allNodes.length; i++) {
      for (let j = i + 1; j < allNodes.length; j++) {
        const nodeA = allNodes[i];
        const nodeB = allNodes[j];
        if (!nodeA || !nodeB) continue;

        // Static-to-static: same category
        if (!nodeA.isAI && !nodeB.isAI && nodeA.skill.category === nodeB.skill.category) {
          connections.push({ fromIndex: i, toIndex: j });
        }

        // AI-to-static: same category
        if (nodeA.isAI && !nodeB.isAI && nodeA.aiSkill.category === nodeB.skill.category) {
          connections.push({ fromIndex: i, toIndex: j });
        }
        if (!nodeA.isAI && nodeB.isAI && nodeA.skill.category === nodeB.aiSkill.category) {
          connections.push({ fromIndex: i, toIndex: j });
        }
      }
    }
    connectionsRef.current = connections;
  }, [dimensions, aiSkills, aiMaterializeStates]);

  // Handle click on canvas
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas || !onNodeSelect) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Find clicked node
      for (const node of nodesRef.current) {
        const dx = node.x - x;
        const dy = node.y - y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist <= node.radius + 5) {
          onNodeSelect(node.label);
          return;
        }
      }

      // Clicked empty space
      onNodeSelect(null);
    },
    [onNodeSelect],
  );

  // Handle mouse move for hover
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let found: string | null = null;
    for (const node of nodesRef.current) {
      const dx = node.x - x;
      const dy = node.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= node.radius + 5) {
        found = node.label;
        break;
      }
    }

    setHoveredNode(found);
  }, []);

  // Main draw effect
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
      const connections = connectionsRef.current;

      if (nodes.length === 0) {
        if (shouldAnimate) {
          animationId = requestAnimationFrame(draw);
        }
        return;
      }

      // Draw connections
      for (const { fromIndex, toIndex } of connections) {
        const nodeA = nodes[fromIndex];
        const nodeB = nodes[toIndex];
        if (!nodeA || !nodeB) continue;

        // Skip connections to hidden AI nodes
        if (nodeA.isAI) {
          const params = getMaterializeDrawParams(nodeA.materializePhase, nodeA.materializeProgress);
          if (params.opacity < 0.3) continue;
        }
        if (nodeB.isAI) {
          const params = getMaterializeDrawParams(nodeB.materializePhase, nodeB.materializeProgress);
          if (params.opacity < 0.3) continue;
        }

        const floatAX = shouldAnimate ? Math.sin(time + nodeA.x * 0.01) * 2 : 0;
        const floatAY = shouldAnimate ? Math.cos(time + nodeA.y * 0.01) * 2 : 0;
        const floatBX = shouldAnimate ? Math.sin(time + nodeB.x * 0.01) * 2 : 0;
        const floatBY = shouldAnimate ? Math.cos(time + nodeB.y * 0.01) * 2 : 0;

        // AI connections are fuchsia-tinted
        const isAIConnection = nodeA.isAI || nodeB.isAI;
        ctx.strokeStyle = isAIConnection ? 'rgba(217, 70, 239, 0.2)' : 'rgba(64, 64, 64, 0.2)';
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.moveTo(nodeA.x + floatAX, nodeA.y + floatAY);
        ctx.lineTo(nodeB.x + floatBX, nodeB.y + floatBY);
        ctx.stroke();
      }

      // Draw nodes
      for (const node of nodes) {
        const floatX = shouldAnimate ? Math.sin(time + node.x * 0.01) * 2 : 0;
        const floatY = shouldAnimate ? Math.cos(time + node.y * 0.01) * 2 : 0;
        const isSelected = selectedSkillId === node.label;
        const isHovered = hoveredNode === node.label;

        if (node.isAI) {
          // Draw AI node with materialize animation
          drawAINode(ctx, node.x + floatX, node.y + floatY, node, time, isSelected, isHovered);
        } else {
          // Draw static node
          drawStaticNode(ctx, node.x + floatX, node.y + floatY, node, isSelected, isHovered);
        }
      }

      if (shouldAnimate) {
        animationId = requestAnimationFrame(draw);
      }
    };

    const { width, height } = setupCanvas();
    setDimensions({ width, height });
    draw();

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
  }, [shouldAnimate, selectedSkillId, hoveredNode]);

  // AI-discovered skills need individual materialize trackers
  const aiOnlySkills = aiSkills.filter(s => s.is_ai_discovered);

  return (
    <div className='border-line bg-surface/30 relative h-100 rounded-lg border'>
      {/* Materialize state trackers (invisible) */}
      {aiOnlySkills.map((skill, i) => (
        <AINodeMaterializeTracker key={skill.name} skill={skill} index={i} onStateChange={handleMaterializeChange} />
      ))}

      <canvas
        ref={canvasRef}
        className={`size-full ${hoveredNode ? 'cursor-pointer' : ''}`}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onKeyDown={e => {
          if (e.key === 'Escape' && onNodeSelect) {
            onNodeSelect(null);
          }
        }}
        tabIndex={0}
        role='img'
        aria-label='Skills visualization graph'
      />

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
        {aiOnlySkills.length > 0 && (
          <span className='text-subtle-foreground flex items-center gap-1.5 text-xs'>
            <span className='bg-fuchsia size-2 rounded-full' />
            <span>AI発見</span>
          </span>
        )}
      </div>
    </div>
  );
};

function drawStaticNode(ctx: CanvasRenderingContext2D, x: number, y: number, node: StaticNode, isSelected: boolean, isHovered: boolean) {
  const scale = isSelected ? 1.3 : isHovered ? 1.15 : 1;
  const radius = node.radius * scale;

  // Glow for selected
  if (isSelected) {
    ctx.shadowColor = node.color;
    ctx.shadowBlur = 15;
  }

  ctx.fillStyle = node.color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  if (node.showLabel || isSelected || isHovered) {
    ctx.fillStyle = isSelected ? node.color : 'rgba(255, 255, 255, 0.5)';
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(node.label, x, y + radius + 12);
  }
}

function drawAINode(ctx: CanvasRenderingContext2D, x: number, y: number, node: AINode, time: number, isSelected: boolean, isHovered: boolean) {
  const params = getMaterializeDrawParams(node.materializePhase, node.materializeProgress);

  if (params.opacity === 0) return;

  const baseRadius = node.radius;
  const scale = params.scale * (isSelected ? 1.3 : isHovered ? 1.15 : 1);
  const radius = baseRadius * scale;

  ctx.globalAlpha = params.opacity;

  // Crosshair phase
  if (params.showCrosshair) {
    const crosshairSize = 20;
    ctx.strokeStyle = COLORS.fuchsia;
    ctx.lineWidth = 1;

    // Horizontal line
    ctx.beginPath();
    ctx.moveTo(x - crosshairSize, y);
    ctx.lineTo(x + crosshairSize, y);
    ctx.stroke();

    // Vertical line
    ctx.beginPath();
    ctx.moveTo(x, y - crosshairSize);
    ctx.lineTo(x, y + crosshairSize);
    ctx.stroke();

    // Corner brackets
    const bracketSize = 8;
    const bracketOffset = crosshairSize - 5;
    ctx.beginPath();
    // Top-left
    ctx.moveTo(x - bracketOffset, y - bracketOffset + bracketSize);
    ctx.lineTo(x - bracketOffset, y - bracketOffset);
    ctx.lineTo(x - bracketOffset + bracketSize, y - bracketOffset);
    // Top-right
    ctx.moveTo(x + bracketOffset - bracketSize, y - bracketOffset);
    ctx.lineTo(x + bracketOffset, y - bracketOffset);
    ctx.lineTo(x + bracketOffset, y - bracketOffset + bracketSize);
    // Bottom-right
    ctx.moveTo(x + bracketOffset, y + bracketOffset - bracketSize);
    ctx.lineTo(x + bracketOffset, y + bracketOffset);
    ctx.lineTo(x + bracketOffset - bracketSize, y + bracketOffset);
    // Bottom-left
    ctx.moveTo(x - bracketOffset + bracketSize, y + bracketOffset);
    ctx.lineTo(x - bracketOffset, y + bracketOffset);
    ctx.lineTo(x - bracketOffset, y + bracketOffset - bracketSize);
    ctx.stroke();
  }

  // Wireframe phase
  if (params.showWireframe) {
    ctx.strokeStyle = COLORS.fuchsia;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);

    // Spinning wireframe circle
    const wireframeRadius = radius * 1.5;
    ctx.beginPath();
    ctx.arc(x, y, wireframeRadius, time * 2, time * 2 + Math.PI * 1.5);
    ctx.stroke();

    ctx.setLineDash([]);
  }

  // Particles phase
  if (params.showParticles) {
    const particleCount = 8;
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2 + time * 3;
      const particleRadius = radius * 2 * (1 - node.materializeProgress);
      const px = x + Math.cos(angle) * particleRadius;
      const py = y + Math.sin(angle) * particleRadius;

      ctx.fillStyle = COLORS.fuchsiaBright;
      ctx.beginPath();
      ctx.arc(px, py, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Flash phase
  if (params.flashIntensity > 0) {
    const flashRadius = radius * (1 + params.flashIntensity * 0.5);
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, flashRadius * 2);
    gradient.addColorStop(0, `rgba(217, 70, 239, ${params.flashIntensity * 0.8})`);
    gradient.addColorStop(1, 'rgba(217, 70, 239, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, flashRadius * 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Main node
  if (isSelected || params.flashIntensity > 0) {
    ctx.shadowColor = COLORS.fuchsia;
    ctx.shadowBlur = 15 + params.flashIntensity * 10;
  }

  ctx.fillStyle = COLORS.fuchsia;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  // Label
  if ((node.showLabel || isSelected || isHovered) && params.opacity > 0.8) {
    ctx.fillStyle = isSelected ? COLORS.fuchsia : 'rgba(217, 70, 239, 0.7)';
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(node.label, x, y + radius + 12);
  }

  ctx.globalAlpha = 1;
}

export default SkillsVisualization;
