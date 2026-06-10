import type { FC, ReactNode } from 'react';

import { useEffect, useState } from 'react';

import { useReducedMotion } from '#hooks/useReducedMotion';

type CopyState = 'idle' | 'copied' | 'error';

export interface SocialLink {
  name: string;
  url: string;
  handle: string;
  icon: ReactNode;
  color: string;
  iconHover: string;
  copyAction?: boolean;
}

interface SocialLinkCardProps {
  link: SocialLink;
  index: number;
}

const SocialLinkCard: FC<SocialLinkCardProps> = ({ link, index }) => {
  const prefersReducedMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(prefersReducedMotion);
  const [copyState, setCopyState] = useState<CopyState>('idle');

  useEffect(() => {
    if (prefersReducedMotion) return; // Skip entrance animation when reduced motion is enabled
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, index * 100);
    return () => {
      clearTimeout(timer);
    };
  }, [index, prefersReducedMotion]);

  // Reset the copied/error feedback after a short delay
  useEffect(() => {
    if (copyState === 'idle') return;
    const timer = setTimeout(() => {
      setCopyState('idle');
    }, 1500);
    return () => {
      clearTimeout(timer);
    };
  }, [copyState]);

  const handleCopyClick = async () => {
    try {
      await navigator.clipboard.writeText(link.handle);
      setCopyState('copied');
    } catch {
      // Surface the failure instead of silently swallowing it
      setCopyState('error');
    }
  };

  const statusText = copyState === 'copied' ? 'コピーしました' : copyState === 'error' ? 'コピーに失敗しました' : link.handle;
  const statusColor = copyState === 'copied' ? 'text-neon' : copyState === 'error' ? 'text-orange' : 'text-subtle-foreground';

  const cardClasses = `group flex items-center gap-4 rounded-lg border border-line bg-surface p-4 transition-all duration-normal ${link.color} hover:shadow-lg ${
    isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
  }`;

  const content = (
    <>
      <span className={`bg-muted duration-normal flex size-12 items-center justify-center rounded-lg transition-all group-hover:scale-105 ${link.iconHover}`}>
        {link.icon}
      </span>
      <div>
        <span className='text-foreground group-hover:text-neon block font-medium'>{link.name}</span>
        <span className={`${statusColor} font-mono text-sm`} role={link.copyAction === true ? 'status' : undefined}>
          {statusText}
        </span>
      </div>
      <span className='text-subtle-foreground ml-auto transition-transform group-hover:translate-x-1'>→</span>
    </>
  );

  if (link.copyAction === true) {
    return (
      // oxlint-disable-next-line typescript/no-misused-promises -- Event handler, Promise is intentionally not awaited
      <button type='button' onClick={handleCopyClick} className={`${cardClasses} cursor-pointer text-left`}>
        {content}
      </button>
    );
  }

  return (
    <a href={link.url} target={link.url === '#' ? undefined : '_blank'} rel={link.url === '#' ? undefined : 'noopener noreferrer'} className={cardClasses}>
      {content}
    </a>
  );
};

export default SocialLinkCard;
