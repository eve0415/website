// AISkillPanel - Expandable panel with typewriter effect for AI skill details

import type { AISkill } from '#workflows/-utils/ai-skills-types';
import type { FC } from 'react';

import { useEffect, useRef } from 'react';

import { useTypedText } from '#hooks/useTypedText';

interface Props {
  skill: AISkill;
  isExpanded: boolean;
  onClose: () => void;
}

const AISkillPanel: FC<Props> = ({ skill, isExpanded, onClose }) => {
  const { displayedText, isTyping, skipToEnd } = useTypedText({
    text: skill.description_ja,
    speed: 10,
    enabled: isExpanded,
  });

  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  // Move focus into the panel on open and return it to the trigger on close
  // so keyboard and screen-reader users aren't stranded.
  useEffect(() => {
    if (!isExpanded) return;
    triggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    panelRef.current?.focus();
    return () => {
      triggerRef.current?.focus();
    };
  }, [isExpanded]);

  // Close on Escape from anywhere while the panel is open
  useEffect(() => {
    if (!isExpanded) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isExpanded, onClose]);

  if (!isExpanded) return;

  const levelLabels: Record<string, string> = {
    expert: 'Expert',
    proficient: 'Proficient',
    learning: 'Learning',
  };

  const trendLabels: Record<string, string> = {
    rising: '↑ 上昇中',
    stable: '→ 安定',
    declining: '↓ 低下傾向',
  };

  const trendColors: Record<string, string> = {
    rising: 'text-neon',
    stable: 'text-subtle-foreground',
    declining: 'text-orange',
  };

  return (
    <div
      ref={panelRef}
      role='dialog'
      aria-modal='true'
      aria-label={skill.name}
      tabIndex={-1}
      className='border-fuchsia/30 bg-surface/95 animate-fade-in-scale fixed right-4 bottom-4 z-50 w-96 max-w-[calc(100vw-2rem)] rounded-lg border backdrop-blur-sm focus:outline-none md:right-8 md:bottom-8'
    >
      {/* Header */}
      <div className='border-fuchsia/20 flex items-center justify-between border-b p-4'>
        <div className='flex items-center gap-3'>
          <span className='bg-fuchsia/20 text-fuchsia rounded px-2 py-0.5 font-mono text-xs'>{skill.category}</span>
          <h3 className='ai-glow text-fuchsia font-bold'>{skill.name}</h3>
        </div>
        <button type='button' onClick={onClose} className='text-subtle-foreground hover:text-foreground p-1 transition-colors' aria-label='閉じる'>
          <svg className='size-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className='p-4'>
        {/* Level and Confidence */}
        <div className='mb-4 flex items-center gap-4'>
          <span className='text-fuchsia font-mono text-sm'>{levelLabels[skill.level]}</span>
          <span className='text-subtle-foreground text-xs'>信頼度: {Math.round(skill.confidence * 100)}%</span>
          <span className={`text-xs ${trendColors[skill.trend]}`}>{trendLabels[skill.trend]}</span>
        </div>

        {/* Description with typewriter effect */}
        <div className='mb-4 min-h-16'>
          <p className='text-foreground text-sm leading-relaxed'>
            {displayedText}
            {isTyping && <span className='animate-typewriter-cursor ml-0.5' />}
          </p>
          {isTyping && (
            <button type='button' onClick={skipToEnd} className='text-subtle-foreground hover:text-fuchsia mt-2 text-xs transition-colors'>
              [Skip]
            </button>
          )}
        </div>

        {/* Evidence */}
        {skill.evidence.length > 0 && (
          <div className='border-fuchsia/10 border-t pt-4'>
            <h4 className='text-subtle-foreground mb-2 font-mono text-xs uppercase'>Evidence</h4>
            <ul className='space-y-1'>
              {skill.evidence.map(e => (
                <li key={`${skill.name}-${e}`} className='text-muted-foreground text-xs'>
                  <span className='text-fuchsia/50 mr-2'>•</span>
                  {e}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* AI badge */}
        {skill.is_ai_discovered && (
          <div className='mt-4 flex items-center gap-2'>
            <span className='ai-shimmer-border rounded px-2 py-0.5'>
              <span className='text-fuchsia text-xs'>✨ AI発見</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AISkillPanel;
