import type { SocialLink } from './-components/SocialLinkCard/social-link-card';
import type { FC } from 'react';

import { RouterProvider, createMemoryHistory, createRootRoute, createRouter } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { expect, within } from 'storybook/test';

import preview from '#.storybook/preview';
import { testAllViewports } from '#.storybook/viewports';

import BlueskyIcon from './-components/icons/bluesky-icon';
import DiscordIcon from './-components/icons/discord-icon';
import GitHubIcon from './-components/icons/github-icon';
import XIcon from './-components/icons/x-icon';
import SocialLinkCard from './-components/SocialLinkCard/social-link-card';

// Recreate social links data
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

// Mock CurrentTime to avoid time-based flakiness
const MockCurrentTime: FC = () => {
  const [time, setTime] = useState('12:00:00');

  useEffect(() => {
    // Update once to show it's working, then stop
    const timer = setTimeout(() => {
      setTime('12:00:01');
    }, 100);
    return () => {
      clearTimeout(timer);
    };
  }, []);

  return <span className='text-muted-foreground font-mono'>{time}</span>;
};

// Mock ContactForm to avoid server function issues
const MockContactForm: FC = () => (
  <form data-testid='contact-form' className='space-y-6'>
    <div className='group'>
      <label htmlFor='name' className='text-muted-foreground mb-2 block text-sm'>
        お名前
      </label>
      <input
        type='text'
        id='name'
        className='border-line bg-surface text-foreground placeholder:text-subtle-foreground w-full rounded-lg border px-4 py-3'
        placeholder='山田太郎'
      />
    </div>
    <div className='group'>
      <label htmlFor='email' className='text-muted-foreground mb-2 block text-sm'>
        メールアドレス
      </label>
      <input
        type='email'
        id='email'
        className='border-line bg-surface text-foreground placeholder:text-subtle-foreground w-full rounded-lg border px-4 py-3'
        placeholder='you@example.com'
      />
    </div>
    <div className='group'>
      <label htmlFor='message' className='text-muted-foreground mb-2 block text-sm'>
        メッセージ
      </label>
      <textarea
        id='message'
        rows={5}
        className='border-line bg-surface text-foreground placeholder:text-subtle-foreground w-full resize-none rounded-lg border px-4 py-3'
        placeholder='ご用件をお書きください...'
      />
    </div>
    <button type='button' className='bg-neon text-background w-full rounded-lg px-6 py-3 font-medium'>
      送信する
    </button>
  </form>
);

// Simplified LinkPage for Storybook (without router dependencies)
const LinkPageForStory: FC = () => (
  <main className='min-h-dvh px-6 py-24 md:px-12'>
    {/* Header */}
    <header className='mb-16'>
      <a href='/' className='group text-subtle-foreground hover:text-neon mb-8 inline-flex items-center gap-2 text-sm transition-colors'>
        <span className='transition-transform group-hover:-translate-x-1'>←</span>
        <span>Index</span>
      </a>
      <h1 className='text-4xl font-bold tracking-tight md:text-5xl'>Link</h1>
      <p className='text-muted-foreground mt-4'>連絡先 / SNS</p>
    </header>

    <div className='grid gap-16 lg:grid-cols-2'>
      {/* Social Links */}
      <section>
        {/* oxlint-disable-next-line eslint-plugin-react(jsx-no-comment-textnodes) -- Decorative code comment style */}
        <h2 className='text-subtle-foreground mb-8 font-mono text-sm tracking-wider uppercase'>// Social</h2>
        <div className='grid gap-4'>
          {socialLinks.map((link, index) => (
            <SocialLinkCard key={link.name} link={link} index={index} />
          ))}
        </div>
      </section>

      {/* Contact Form */}
      <section>
        {/* oxlint-disable-next-line eslint-plugin-react(jsx-no-comment-textnodes) -- Decorative code comment style */}
        <h2 className='text-subtle-foreground mb-8 font-mono text-sm tracking-wider uppercase'>// Contact</h2>
        <MockContactForm />
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
            <MockCurrentTime />
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
      <a href='/skills' className='group text-subtle-foreground hover:text-neon flex items-center gap-2 text-sm transition-colors'>
        <span className='transition-transform group-hover:-translate-x-1'>←</span>
        <span>Skills Matrix</span>
      </a>
    </div>
  </main>
);

const meta = preview.meta({
  component: LinkPageForStory,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    Story => {
      const rootRoute = createRootRoute({
        component: Story,
      });
      const router = createRouter({
        routeTree: rootRoute,
        history: createMemoryHistory({ initialEntries: ['/link'] }),
      });
      return <RouterProvider router={router} />;
    },
    Story => (
      <div className='bg-background min-h-dvh'>
        <Story />
      </div>
    ),
  ],
});

/**
 * Default Link page with all sections
 */
export const Default = meta.story({
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify header
    await expect(canvas.getByText('Link')).toBeInTheDocument();
    await expect(canvas.getByText('連絡先 / SNS')).toBeInTheDocument();

    // Verify social links section
    await expect(canvas.getByText('// Social')).toBeInTheDocument();
    await expect(canvas.getByText('GitHub')).toBeInTheDocument();
    await expect(canvas.getByText('Twitter / X')).toBeInTheDocument();
    await expect(canvas.getByText('Bluesky')).toBeInTheDocument();
    await expect(canvas.getByText('Discord')).toBeInTheDocument();

    // Verify contact form section
    await expect(canvas.getByText('// Contact')).toBeInTheDocument();
    await expect(canvas.getByTestId('contact-form')).toBeInTheDocument();

    // Verify location/time section
    await expect(canvas.getByText('Tokyo, Japan')).toBeInTheDocument();
    await expect(canvas.getByText('UTC+9 (JST)')).toBeInTheDocument();
    await expect(canvas.getByText('Available')).toBeInTheDocument();
  },
});

/**
 * Static version for visual regression testing
 */
export const Static = meta.story({
  play: async context => {
    await testAllViewports(context);

    const canvas = within(context.canvasElement);
    await expect(canvas.getByText('Link')).toBeInTheDocument();
  },
});

/**
 * Mobile layout showing responsive design
 */
export const MobileLayout = meta.story({
  play: async context => {
    const { setViewport } = await import('#.storybook/viewports');
    await setViewport('mobile');

    const canvas = within(context.canvasElement);

    // Content should still be visible on mobile
    await expect(canvas.getByText('Link')).toBeInTheDocument();
    await expect(canvas.getByText('GitHub')).toBeInTheDocument();
    await expect(canvas.getByTestId('contact-form')).toBeInTheDocument();
  },
});
