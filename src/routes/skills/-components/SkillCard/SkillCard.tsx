import type { FC } from "react";
import type { Skill } from "../../-config/skills-config";

import { useEffect, useState } from "react";

import { levelConfig } from "../../-config/skills-config";

interface SkillCardProps {
  skill: Skill;
  index: number;
}

const SkillCard: FC<SkillCardProps> = ({ skill, index }) => {
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

export default SkillCard;
