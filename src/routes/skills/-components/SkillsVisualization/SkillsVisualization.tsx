import type { FC } from "react";

import { useEffect, useRef } from "react";

import { levelConfig, skills } from "../../-config/skills-config";

const SkillsVisualization: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    // Create nodes for each skill
    const nodes = skills.map((skill, i) => {
      const angle = (i / skills.length) * Math.PI * 2;
      const radiusBase = Math.min(canvas.offsetWidth, canvas.offsetHeight) * 0.35;
      const categoryOffset =
        skill.category === "language" ? 0 : skill.category === "infrastructure" ? 0.1 : 0.2;
      const levelOffset = skill.level === "expert" ? 0 : skill.level === "proficient" ? 0.15 : 0.3;
      const radius = radiusBase * (0.8 + categoryOffset - levelOffset);

      return {
        x: canvas.offsetWidth / 2 + Math.cos(angle) * radius,
        y: canvas.offsetHeight / 2 + Math.sin(angle) * radius,
        skill,
      };
    });

    let animationId: number;
    let time = 0;

    const draw = () => {
      if (!ctx || !canvas) return;

      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;

      ctx.clearRect(0, 0, width, height);

      time += 0.01;

      // Draw connections between same-category skills
      ctx.strokeStyle = "rgba(64, 64, 64, 0.2)";
      ctx.lineWidth = 1;

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const nodeA = nodes[i];
          const nodeB = nodes[j];
          if (nodeA && nodeB && nodeA.skill.category === nodeB.skill.category) {
            const floatAX = Math.sin(time + nodeA.x * 0.01) * 2;
            const floatAY = Math.cos(time + nodeA.y * 0.01) * 2;
            const floatBX = Math.sin(time + nodeB.x * 0.01) * 2;
            const floatBY = Math.cos(time + nodeB.y * 0.01) * 2;

            ctx.beginPath();
            ctx.moveTo(nodeA.x + floatAX, nodeA.y + floatAY);
            ctx.lineTo(nodeB.x + floatBX, nodeB.y + floatBY);
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (const node of nodes) {
        // Subtle floating animation
        const floatX = Math.sin(time + node.x * 0.01) * 2;
        const floatY = Math.cos(time + node.y * 0.01) * 2;

        const config = levelConfig[node.skill.level];
        const baseRadius =
          node.skill.level === "expert" ? 8 : node.skill.level === "proficient" ? 6 : 4;

        // Node
        const colors: Record<string, string> = {
          "accent-primary": "#00ff88",
          "accent-secondary": "#00d4ff",
          "accent-tertiary": "#ff6b35",
        };
        ctx.fillStyle = colors[config.color] || "#00ff88";
        ctx.beginPath();
        ctx.arc(node.x + floatX, node.y + floatY, baseRadius, 0, Math.PI * 2);
        ctx.fill();

        // Label for expert skills
        if (node.skill.level === "expert") {
          ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
          ctx.font = "10px JetBrains Mono, monospace";
          ctx.textAlign = "center";
          ctx.fillText(node.skill.name, node.x + floatX, node.y + floatY + 18);
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="relative h-100 rounded-lg border border-border-subtle bg-bg-secondary/30">
      <canvas ref={canvasRef} className="size-full" />
      {/* Legend overlay */}
      <div className="pointer-events-none absolute bottom-4 left-4 flex flex-wrap gap-3">
        {Object.entries(levelConfig).map(([level, config]) => {
          const colors: Record<string, string> = {
            "accent-primary": "bg-accent-primary",
            "accent-secondary": "bg-accent-secondary",
            "accent-tertiary": "bg-accent-tertiary",
          };
          return (
            <span key={level} className="flex items-center gap-1.5 text-text-muted text-xs">
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
