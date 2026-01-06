import type { FC } from 'react';

import { useEffect, useState } from 'react';

export interface SocialLink {
  name: string;
  url: string;
  handle: string;
  icon: string;
  color: string;
}

interface SocialLinkCardProps {
  link: SocialLink;
  index: number;
}

const SocialLinkCard: FC<SocialLinkCardProps> = ({ link, index }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), index * 100);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <a
      href={link.url}
      target={link.url !== '#' ? '_blank' : undefined}
      rel={link.url !== '#' ? 'noopener noreferrer' : undefined}
      className={`group flex items-center gap-4 rounded-lg border border-line bg-surface p-4 transition-all duration-normal ${link.color} hover:shadow-lg ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
    >
      <span className='flex size-12 items-center justify-center rounded-lg bg-muted font-mono text-sm text-subtle-foreground transition-colors group-hover:bg-neon/10 group-hover:text-neon'>
        {link.icon}
      </span>
      <div>
        <span className='block font-medium text-foreground group-hover:text-neon'>{link.name}</span>
        <span className='font-mono text-sm text-subtle-foreground'>{link.handle}</span>
      </div>
      <span className='ml-auto text-subtle-foreground transition-transform group-hover:translate-x-1'>→</span>
    </a>
  );
};

export default SocialLinkCard;
