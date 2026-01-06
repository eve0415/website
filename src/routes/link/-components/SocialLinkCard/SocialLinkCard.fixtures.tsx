import type { SocialLink } from './SocialLinkCard';

export const githubLink: SocialLink = {
  name: 'GitHub',
  url: 'https://github.com/eve0415',
  handle: '@eve0415',
  icon: '</> ',
  color: 'hover:border-foreground/50',
};

export const twitterLink: SocialLink = {
  name: 'Twitter',
  url: 'https://twitter.com/eve0415_',
  handle: '@eve0415_',
  icon: '𝕏',
  color: 'hover:border-foreground/50',
};

export const discordLink: SocialLink = {
  name: 'Discord',
  url: 'https://discord.com/users/421094998384336896',
  handle: 'eve0415',
  icon: '◎',
  color: 'hover:border-[#5865F2]/50',
};

export const placeholderLink: SocialLink = {
  name: 'Coming Soon',
  url: '#',
  handle: 'TBD',
  icon: '?',
  color: 'hover:border-muted/50',
};
