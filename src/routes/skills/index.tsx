import type { FC } from "react";

import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

interface Skill {
  name: string;
  category: "language" | "infrastructure" | "domain";
  level: "expert" | "proficient" | "learning";
  description?: string;
}

const skills: Skill[] = [
  // Languages
  {
    name: "TypeScript",
    category: "language",
    level: "expert",
    description: "主要開発言語。型安全なコードベース構築に活用",
  },
  {
    name: "JavaScript",
    category: "language",
    level: "expert",
    description: "フルスタック開発の基盤",
  },
  {
    name: "Java",
    category: "language",
    level: "proficient",
    description: "Minecraft mod開発で使用",
  },
  {
    name: "Kotlin",
    category: "language",
    level: "proficient",
    description: "JVM言語の代替として学習",
  },
  {
    name: "Rust",
    category: "language",
    level: "learning",
    description: "システムプログラミング学習中",
  },
  { name: "Go", category: "language", level: "learning", description: "インフラツーリング学習中" },
  {
    name: "Python",
    category: "language",
    level: "proficient",
    description: "スクリプトとデータ処理",
  },
  // Infrastructure
  {
    name: "Docker",
    category: "infrastructure",
    level: "expert",
    description: "コンテナ化の標準ツール",
  },
  {
    name: "Kubernetes",
    category: "infrastructure",
    level: "proficient",
    description: "オーケストレーション",
  },
  {
    name: "Cloudflare",
    category: "infrastructure",
    level: "expert",
    description: "このサイトもCloudflare Workersで動作",
  },
  {
    name: "GitHub Actions",
    category: "infrastructure",
    level: "expert",
    description: "CI/CD自動化",
  },
  {
    name: "OpenTelemetry",
    category: "infrastructure",
    level: "proficient",
    description: "可観測性の実装",
  },
  // Domains
  {
    name: "Discord Bots",
    category: "domain",
    level: "expert",
    description: "複数の本番Bot開発経験",
  },
  {
    name: "Web Development",
    category: "domain",
    level: "expert",
    description: "フロントエンドからバックエンドまで",
  },
  {
    name: "Minecraft Mods",
    category: "domain",
    level: "proficient",
    description: "IFPatcherで795k+ダウンロード",
  },
  { name: "DevTools", category: "domain", level: "proficient", description: "開発者体験の改善" },
];

const categoryLabels: Record<string, string> = {
  language: "言語",
  infrastructure: "インフラ",
  domain: "ドメイン",
};

const categoryIcons: Record<string, string> = {
  language: "</>",
  infrastructure: "⚙",
  domain: "◈",
};

const levelConfig = {
  expert: { color: "accent-primary", label: "Expert", progress: 100 },
  proficient: { color: "accent-secondary", label: "Proficient", progress: 70 },
  learning: { color: "accent-tertiary", label: "Learning", progress: 35 },
};

const SkillCard: FC<{ skill: Skill; index: number }> = ({ skill, index }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const config = levelConfig[skill.level];

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), index * 50);
    return () => clearTimeout(timer);
  }, [index]);

  const colorClasses = {
    "accent-primary": {
      border: "hover:border-accent-primary/50",
      text: "group-hover:text-accent-primary",
      bg: "bg-accent-primary/10",
      textColor: "text-accent-primary",
      bar: "bg-accent-primary/30",
    },
    "accent-secondary": {
      border: "hover:border-accent-secondary/50",
      text: "group-hover:text-accent-secondary",
      bg: "bg-accent-secondary/10",
      textColor: "text-accent-secondary",
      bar: "bg-accent-secondary/30",
    },
    "accent-tertiary": {
      border: "hover:border-accent-tertiary/50",
      text: "group-hover:text-accent-tertiary",
      bg: "bg-accent-tertiary/10",
      textColor: "text-accent-tertiary",
      bar: "bg-accent-tertiary/30",
    },
  };

  const colors = colorClasses[config.color as keyof typeof colorClasses];

  return (
    <div
      className={`group relative cursor-default rounded-lg border border-border-subtle bg-bg-secondary p-4 transition-all duration-normal ${colors.border} hover:shadow-lg ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Progress bar background */}
      <div className="absolute inset-0 overflow-hidden rounded-lg">
        <div
          className={`absolute bottom-0 left-0 h-1 ${colors.bar} transition-all duration-slow`}
          style={{ width: isHovered ? `${config.progress}%` : "0%" }}
        />
      </div>

      <div className="relative">
        <div className="flex items-start justify-between gap-2">
          <h3 className={`font-bold font-mono text-text-primary ${colors.text}`}>{skill.name}</h3>
          <span
            className={`rounded-full ${colors.bg} px-2 py-0.5 font-mono ${colors.textColor} text-xs`}
          >
            {config.label}
          </span>
        </div>
        {skill.description && (
          <p className="mt-2 line-clamp-2 text-sm text-text-muted">{skill.description}</p>
        )}
      </div>
    </div>
  );
};

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
    <div className="relative h-[400px] rounded-lg border border-border-subtle bg-bg-secondary/30">
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

const SkillsPage: FC = () => {
  const groupedSkills = skills.reduce<Record<string, Skill[]>>((acc, skill) => {
    const category = skill.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(skill);
    return acc;
  }, {});

  return (
    <main className="min-h-dvh px-6 py-24 md:px-12">
      {/* Header */}
      <header className="mb-16">
        <Link
          to="/"
          className="group mb-8 inline-flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-accent-primary"
        >
          <span className="transition-transform group-hover:-translate-x-1">←</span>
          <span>Index</span>
        </Link>
        <h1 className="animate-fade-in-up font-bold text-4xl tracking-tight md:text-5xl">
          Skills Matrix
        </h1>
        <p className="mt-4 text-text-secondary">技術スタック</p>
      </header>

      {/* Legend */}
      <div className="mb-12 flex flex-wrap gap-6">
        {Object.entries(levelConfig).map(([level, config]) => {
          const colors: Record<string, string> = {
            "accent-primary": "bg-accent-primary",
            "accent-secondary": "bg-accent-secondary",
            "accent-tertiary": "bg-accent-tertiary",
          };
          return (
            <div key={level} className="flex items-center gap-2">
              <span className={`size-3 rounded-full ${colors[config.color]}`} />
              <span className="text-sm text-text-muted">{config.label}</span>
              <span className="font-mono text-text-muted text-xs opacity-50">
                ({config.progress}%)
              </span>
            </div>
          );
        })}
      </div>

      {/* Skills Visualization */}
      <section className="mb-16">
        <SkillsVisualization />
      </section>

      {/* Skills Grid by Category */}
      <div className="grid gap-12 lg:grid-cols-3">
        {(Object.keys(groupedSkills) as Array<keyof typeof categoryLabels>).map((category) => (
          <section key={category}>
            <h2 className="mb-6 flex items-center gap-2 border-border-subtle border-b pb-2 font-mono text-sm text-text-muted uppercase tracking-wider">
              <span>{categoryIcons[category]}</span>
              <span>{categoryLabels[category]}</span>
            </h2>
            <div className="space-y-3">
              {groupedSkills[category]?.map((skill, index) => (
                <SkillCard key={skill.name} skill={skill} index={index} />
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Learning Journey */}
      <section className="mt-24">
        <h2 className="mb-8 font-bold text-2xl">現在学習中</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="group rounded-lg border border-border-subtle bg-bg-secondary p-6 transition-all duration-normal hover:border-accent-tertiary/30">
            <h3 className="font-bold text-accent-tertiary text-lg">Rust</h3>
            <p className="mt-2 text-sm text-text-secondary">
              システムプログラミングとパフォーマンス最適化のため学習中。
              メモリ安全性と並行処理の理解を深めている。
            </p>
            <div className="mt-4 h-1 w-full rounded-full bg-bg-tertiary">
              <div
                className="h-full rounded-full bg-accent-tertiary transition-all duration-slow"
                style={{ width: "35%" }}
              />
            </div>
          </div>
          <div className="group rounded-lg border border-border-subtle bg-bg-secondary p-6 transition-all duration-normal hover:border-accent-tertiary/30">
            <h3 className="font-bold text-accent-tertiary text-lg">Go</h3>
            <p className="mt-2 text-sm text-text-secondary">
              マイクロサービスとインフラツーリングのため学習中。
              シンプルで効率的なバックエンドサービスの構築を目指す。
            </p>
            <div className="mt-4 h-1 w-full rounded-full bg-bg-tertiary">
              <div
                className="h-full rounded-full bg-accent-tertiary transition-all duration-slow"
                style={{ width: "25%" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Navigation hint */}
      <div className="mt-16 flex justify-center gap-8">
        <Link
          to="/projects"
          className="group flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-accent-primary"
        >
          <span className="transition-transform group-hover:-translate-x-1">←</span>
          <span>Projects</span>
        </Link>
        <Link
          to="/link"
          className="group flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-accent-primary"
        >
          <span>Link</span>
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </Link>
      </div>
    </main>
  );
};

export const Route = createFileRoute("/skills/")({
  component: SkillsPage,
});
