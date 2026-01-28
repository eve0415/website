import type { Skill, SkillColor } from '../../-config/skills-config';
import type { FC } from 'react';

import { useEffect, useState } from 'react';

import { levelConfig } from '../../-config/skills-config';

interface SkillCardProps {
  skill: Skill;
  index: number;
}

const SkillCard: FC<SkillCardProps> = ({ skill, index }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const config = levelConfig[skill.level];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, index * 50);
    return () => {
      clearTimeout(timer);
    };
  }, [index]);

  const colorClasses: Record<SkillColor, { border: string; text: string; bg: string; textColor: string; bar: string }> = {
    neon: {
      border: 'hover:border-neon/50',
      text: 'group-hover:text-neon',
      bg: 'bg-neon/10',
      textColor: 'text-neon',
      bar: 'bg-neon/30',
    },
    cyan: {
      border: 'hover:border-cyan/50',
      text: 'group-hover:text-cyan',
      bg: 'bg-cyan/10',
      textColor: 'text-cyan',
      bar: 'bg-cyan/30',
    },
    orange: {
      border: 'hover:border-orange/50',
      text: 'group-hover:text-orange',
      bg: 'bg-orange/10',
      textColor: 'text-orange',
      bar: 'bg-orange/30',
    },
  };

  const colors = colorClasses[config.color];

  return (
    <div
      className={`group border-line bg-surface duration-normal relative cursor-default rounded-lg border p-4 transition-all ${colors.border} hover:shadow-lg ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
      onMouseEnter={() => {
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
      }}
    >
      {/* Progress bar background */}
      <div className='absolute inset-0 overflow-hidden rounded-lg'>
        <div
          className={`absolute bottom-0 left-0 h-1 ${colors.bar} duration-slow transition-all`}
          style={{ width: isHovered ? `${config.progress}%` : '0%' }}
        />
      </div>

      <div className='relative'>
        <div className='flex items-start justify-between gap-2'>
          <h3 className={`text-foreground font-mono font-bold ${colors.text}`}>{skill.name}</h3>
          <span className={`rounded-full ${colors.bg} px-2 py-0.5 font-mono ${colors.textColor} text-xs`}>{config.label}</span>
        </div>
        {skill.description && <p className='text-subtle-foreground mt-2 line-clamp-2 text-sm'>{skill.description}</p>}
      </div>
    </div>
  );
};

export default SkillCard;
