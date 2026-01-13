import type { SocialLink } from './-components/SocialLinkCard/social-link-card';
import type { FC } from 'react';

import { Link, createFileRoute } from '@tanstack/react-router';

import ContactForm from './-components/ContactForm/contact-form';
import CurrentTime from './-components/CurrentTime/current-time';
import BlueskyIcon from './-components/icons/bluesky-icon';
import DiscordIcon from './-components/icons/discord-icon';
import GitHubIcon from './-components/icons/github-icon';
import XIcon from './-components/icons/x-icon';
import SocialLinkCard from './-components/SocialLinkCard/social-link-card';

const socialLinks: SocialLink[] = [
  {
    name: 'GitHub',
    url: 'https://github.com/eve0415',
    handle: 'eve0415',
    icon: <GitHubIcon className='size-6' />,
    color: 'hover:border-white/50',
    iconHover: 'group-hover:bg-white/10 group-hover:shadow-[0_0_12px_rgba(255,255,255,0.3)]',
  },
  {
    name: 'Twitter / X',
    url: 'https://twitter.com/eveevekun',
    handle: '@eveevekun',
    icon: <XIcon className='size-6' />,
    color: 'hover:border-white/50',
    iconHover: 'group-hover:bg-white/10 group-hover:shadow-[0_0_12px_rgba(255,255,255,0.3)]',
  },
  {
    name: 'Bluesky',
    url: 'https://bsky.app/profile/eve0415.net',
    handle: '@eve0415.net',
    icon: <BlueskyIcon className='size-6' />,
    color: 'hover:border-[#0085ff]/50',
    iconHover: 'group-hover:bg-[#0085ff]/10 group-hover:shadow-[0_0_12px_rgba(0,133,255,0.4)]',
  },
  {
    name: 'Discord',
    url: '#',
    handle: 'eve0415',
    icon: <DiscordIcon className='size-6' />,
    color: 'hover:border-[#5865F2]/50',
    iconHover: 'group-hover:bg-[#5865F2]/10 group-hover:shadow-[0_0_12px_rgba(88,101,242,0.4)]',
    copyAction: true,
  },
];

const LinkPage: FC = () => {
  return (
    <main className='min-h-dvh px-6 py-24 md:px-12'>
      {/* Header */}
      <header className='mb-16'>
        <Link to='/' className='group text-subtle-foreground hover:text-neon mb-8 inline-flex items-center gap-2 text-sm transition-colors'>
          <span className='transition-transform group-hover:-translate-x-1'>←</span>
          <span>Index</span>
        </Link>
        <h1 className='animate-fade-in-up text-4xl font-bold tracking-tight md:text-5xl'>Link</h1>
        <p className='text-muted-foreground mt-4'>連絡先 / SNS</p>
      </header>

      <div className='grid gap-16 lg:grid-cols-2'>
        {/* Social Links */}
        <section>
          <h2 className='text-subtle-foreground mb-8 font-mono text-sm tracking-wider uppercase'>// Social</h2>
          <div className='grid gap-4'>
            {socialLinks.map((link, index) => (
              <SocialLinkCard key={link.name} link={link} index={index} />
            ))}
          </div>
        </section>

        {/* Contact Form */}
        <section>
          <h2 className='text-subtle-foreground mb-8 font-mono text-sm tracking-wider uppercase'>// Contact</h2>
          <ContactForm />
        </section>
      </div>

      {/* Location / Time */}
      <section className='border-line mt-24 border-t pt-12'>
        <div className='text-subtle-foreground flex flex-wrap gap-8 text-sm md:gap-12'>
          <div>
            <span className='block font-mono text-xs tracking-wider uppercase'>Location</span>
            <span className='text-muted-foreground mt-1 block'>Tokyo, Japan</span>
          </div>
          <div>
            <span className='block font-mono text-xs tracking-wider uppercase'>Timezone</span>
            <span className='text-muted-foreground mt-1 block'>UTC+9 (JST)</span>
          </div>
          <div>
            <span className='block font-mono text-xs tracking-wider uppercase'>Current Time</span>
            <span className='mt-1 block'>
              <CurrentTime />
            </span>
          </div>
          <div>
            <span className='block font-mono text-xs tracking-wider uppercase'>Status</span>
            <span className='text-muted-foreground mt-1 flex items-center gap-2'>
              <span className='relative flex size-2'>
                <span className='bg-neon absolute inline-flex size-full animate-ping rounded-full opacity-75' />
                <span className='bg-neon relative inline-flex size-2 rounded-full' />
              </span>
              Available
            </span>
          </div>
        </div>
      </section>

      {/* Navigation hint */}
      <div className='mt-16 flex justify-center'>
        <Link to='/skills' className='group text-subtle-foreground hover:text-neon flex items-center gap-2 text-sm transition-colors'>
          <span className='transition-transform group-hover:-translate-x-1'>←</span>
          <span>Skills Matrix</span>
        </Link>
      </div>
    </main>
  );
};

export const Route = createFileRoute('/link/')({
  component: LinkPage,
});
