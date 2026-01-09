import type { SocialLink } from './social-link-card';

import BlueskyIcon from '../icons/bluesky-icon';
import DiscordIcon from '../icons/discord-icon';
import GitHubIcon from '../icons/github-icon';
import XIcon from '../icons/x-icon';

export const githubLink: SocialLink = {
  name: 'GitHub',
  url: 'https://github.com/eve0415',
  handle: '@eve0415',
  icon: <GitHubIcon className='size-6' />,
  color: 'hover:border-white/50',
  iconHover: 'group-hover:bg-white/10 group-hover:shadow-[0_0_12px_rgba(255,255,255,0.3)]',
};

export const twitterLink: SocialLink = {
  name: 'Twitter / X',
  url: 'https://twitter.com/eve0415_',
  handle: '@eve0415_',
  icon: <XIcon className='size-6' />,
  color: 'hover:border-white/50',
  iconHover: 'group-hover:bg-white/10 group-hover:shadow-[0_0_12px_rgba(255,255,255,0.3)]',
};

export const blueskyLink: SocialLink = {
  name: 'Bluesky',
  url: 'https://bsky.app/profile/eve0415.net',
  handle: '@eve0415.net',
  icon: <BlueskyIcon className='size-6' />,
  color: 'hover:border-[#0085ff]/50',
  iconHover: 'group-hover:bg-[#0085ff]/10 group-hover:shadow-[0_0_12px_rgba(0,133,255,0.4)]',
};

export const discordLink: SocialLink = {
  name: 'Discord',
  url: '#',
  handle: 'eve0415',
  icon: <DiscordIcon className='size-6' />,
  color: 'hover:border-[#5865F2]/50',
  iconHover: 'group-hover:bg-[#5865F2]/10 group-hover:shadow-[0_0_12px_rgba(88,101,242,0.4)]',
  copyAction: true,
};

export const placeholderLink: SocialLink = {
  name: 'Coming Soon',
  url: '#',
  handle: 'TBD',
  icon: <span className='text-sm text-subtle-foreground'>?</span>,
  color: 'hover:border-muted/50',
  iconHover: 'group-hover:bg-muted/20',
};
