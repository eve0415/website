import type { FC } from "react";

import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

interface Project {
  title: string;
  description: string;
  tags: string[];
  links: { label: string; url: string }[];
  highlight?: string;
  highlightSub?: string;
  featured?: boolean;
}

const projects: Project[] = [
  {
    title: "IFPatcher",
    description:
      "Minecraft 1.12.2 向けの Industrial Foregoing パッチモッド。ASM レベルでのバグ修正を実装。",
    tags: ["Java", "Minecraft Forge", "ASM"],
    links: [
      { label: "CurseForge", url: "https://www.curseforge.com/minecraft/mc-mods/ifpatcher" },
      { label: "Modrinth", url: "https://modrinth.com/mod/ifpatcher" },
      { label: "GitHub", url: "https://github.com/eve0415/IFPatcher" },
    ],
    highlight: "795k+",
    highlightSub: "Total Downloads",
    featured: true,
  },
  {
    title: "eve0415.net",
    description: "このウェブサイト自体がポートフォリオ。TanStack Start + Tailwind CSS 4 で構築。",
    tags: ["TypeScript", "React", "Cloudflare"],
    links: [{ label: "ソースコード", url: "https://github.com/eve0415/website" }],
  },
  {
    title: "DevTool",
    description: "開発者向け Discord Bot。各種ユーティリティ機能を提供。",
    tags: ["TypeScript", "Discord.js"],
    links: [{ label: "GitHub", url: "https://github.com/eve0415/DevTool" }],
  },
];

const AnimatedCounter: FC<{ end: number; duration?: number; suffix?: string }> = ({
  end,
  duration = 2000,
  suffix = "",
}) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (hasAnimated) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setHasAnimated(true);
          const startTime = Date.now();
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out expo
            const easeProgress = 1 - Math.pow(2, -10 * progress);
            setCount(Math.floor(end * easeProgress));
            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 },
    );

    const element = document.querySelector(`[data-counter="${end}"]`);
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, [end, duration, hasAnimated]);

  return (
    <span data-counter={end} className="font-mono text-3xl text-accent-primary">
      {count}
      {suffix}
    </span>
  );
};

const ProjectCard: FC<{ project: Project; index: number }> = ({ project, index }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), index * 100);
    return () => clearTimeout(timer);
  }, [index]);

  const baseClasses =
    "group rounded-lg border border-border-subtle bg-bg-secondary p-6 transition-all duration-normal hover:border-accent-primary/30 hover:shadow-accent-glow/10 hover:shadow-lg";
  const visibilityClasses = isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0";
  const featuredClasses = project.featured ? "col-span-full md:p-8" : "";

  return (
    <article
      className={`${baseClasses} ${visibilityClasses} ${featuredClasses} transition-all duration-normal`}
    >
      <div
        className={
          project.featured
            ? "flex flex-col gap-4 md:flex-row md:items-start md:justify-between"
            : ""
        }
      >
        <div>
          <h2
            className={`font-bold text-text-primary group-hover:text-accent-primary ${project.featured ? "text-2xl" : "text-xl"}`}
          >
            {project.title}
          </h2>
          <p className={`mt-2 text-text-secondary ${project.featured ? "" : "text-sm"}`}>
            {project.description}
          </p>
        </div>
        {project.highlight && (
          <div className="flex flex-col items-end gap-1">
            <span className="rounded-full bg-accent-primary/10 px-3 py-1 font-mono text-accent-primary text-sm">
              {project.highlight}
            </span>
            {project.highlightSub && (
              <span className="text-text-muted text-xs">{project.highlightSub}</span>
            )}
          </div>
        )}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-md border border-border-subtle px-2 py-1 text-text-muted text-xs transition-colors group-hover:border-border-default"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className={`flex gap-4 ${project.featured ? "mt-6" : "mt-4"}`}>
        {project.links.map((link) => (
          <a
            key={link.label}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group/link relative text-sm text-text-secondary transition-colors hover:text-accent-primary"
          >
            {link.label}
            <span className="ml-1 inline-block transition-transform group-hover/link:translate-x-0.5">
              →
            </span>
          </a>
        ))}
      </div>
    </article>
  );
};

const ProjectsPage: FC = () => {
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
          Projects
        </h1>
        <p className="mt-4 text-text-secondary">実績とプロジェクト</p>
      </header>

      {/* Projects Grid */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, index) => (
          <ProjectCard key={project.title} project={project} index={index} />
        ))}

        {/* More projects placeholder */}
        <article className="group flex items-center justify-center rounded-lg border border-border-subtle border-dashed bg-bg-secondary/50 p-6 transition-all duration-normal hover:border-accent-primary/30">
          <a
            href="https://github.com/eve0415?tab=repositories"
            target="_blank"
            rel="noopener noreferrer"
            className="text-center text-text-muted transition-colors hover:text-accent-primary"
          >
            <span className="block text-2xl transition-transform group-hover:scale-110">+</span>
            <span className="mt-2 block text-sm">その他のプロジェクト</span>
          </a>
        </article>
      </div>

      {/* GitHub Stats Section */}
      <section className="mt-24">
        <h2 className="mb-8 font-bold text-2xl">GitHub Activity</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="group rounded-lg border border-border-subtle bg-bg-secondary p-6 transition-all duration-normal hover:border-accent-primary/30">
            <AnimatedCounter end={44} />
            <span className="mt-1 block text-sm text-text-muted">Public Repositories</span>
          </div>
          <div className="group rounded-lg border border-border-subtle bg-bg-secondary p-6 transition-all duration-normal hover:border-accent-primary/30">
            <AnimatedCounter end={29} />
            <span className="mt-1 block text-sm text-text-muted">Followers</span>
          </div>
          <div className="group rounded-lg border border-border-subtle bg-bg-secondary p-6 transition-all duration-normal hover:border-accent-primary/30">
            <span className="font-mono text-3xl text-accent-secondary">5+</span>
            <span className="mt-1 block text-sm text-text-muted">Languages</span>
          </div>
        </div>

        {/* Tech breakdown */}
        <div className="mt-8 rounded-lg border border-border-subtle bg-bg-secondary p-6">
          <h3 className="mb-4 font-mono text-sm text-text-muted uppercase tracking-wider">
            // 主要言語
          </h3>
          <div className="flex flex-wrap gap-3">
            {["TypeScript", "JavaScript", "Java", "Kotlin", "Rust", "Go", "Python"].map((lang) => (
              <span
                key={lang}
                className="rounded-full bg-bg-tertiary px-3 py-1 font-mono text-sm text-text-secondary transition-colors hover:bg-accent-primary/10 hover:text-accent-primary"
              >
                {lang}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Navigation hint */}
      <div className="mt-16 flex justify-center">
        <div className="flex items-center gap-4 text-sm text-text-muted">
          <Link
            to="/skills"
            className="group flex items-center gap-2 transition-colors hover:text-accent-primary"
          >
            <span>Skills Matrix</span>
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </div>
    </main>
  );
};

export const Route = createFileRoute("/projects/")({
  component: ProjectsPage,
});
