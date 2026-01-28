import type { FC } from 'react';

import { RouterProvider, createMemoryHistory, createRootRoute, createRouter } from '@tanstack/react-router';
import { expect, within } from 'storybook/test';

import preview from '#.storybook/preview';
import { testAllViewports } from '#.storybook/viewports';

import Background from './-index/Background/background';
import Logo from './-index/logo';

// Simplified IndexPage for Storybook (shows all content immediately, no animations)
const IndexPageForStory: FC<{ showKonami?: boolean }> = ({ showKonami = false }) => (
  <main className={`relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 ${showKonami ? 'animate-glitch' : ''}`}>
    <Background />

    {/* Konami code secret overlay */}
    {showKonami && (
      <div className='bg-background/80 pointer-events-none fixed inset-0 z-50 flex items-center justify-center'>
        <div className='text-center'>
          <span className='text-neon block font-mono text-xl'>SECRET_UNLOCKED</span>
          {/* oxlint-disable-next-line eslint-plugin-react(jsx-no-comment-textnodes) -- Decorative code comment style */}
          <span className='text-subtle-foreground mt-2 block text-sm'>// 何かを見つけた...</span>
        </div>
      </div>
    )}

    {/* Central content */}
    <div className='flex flex-col items-center gap-8'>
      {/* Logo */}
      <div className='text-foreground w-48 md:w-64 lg:w-80'>
        <Logo animate={false} />
      </div>

      {/* Name */}
      <h1 className='text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl'>eve0415</h1>

      {/* Tagline */}
      <p className='text-muted-foreground text-center'>エンジニア</p>

      {/* Navigation prompt */}
      <nav className='text-subtle-foreground mt-12 flex flex-col items-center gap-6 text-sm'>
        {/* oxlint-disable-next-line eslint-plugin-react(jsx-no-comment-textnodes) -- Decorative code comment style */}
        <span className='font-mono text-xs tracking-wider'>// 探索を始める</span>
        <div className='flex gap-6'>
          <a href='/projects' className='group text-muted-foreground hover:text-neon relative px-2 py-1 transition-colors'>
            <span className='font-mono'>[Projects]</span>
            <span className='bg-neon duration-normal absolute -bottom-1 left-0 h-px w-0 transition-all group-hover:w-full' />
          </a>
          <a href='/skills' className='group text-muted-foreground hover:text-neon relative px-2 py-1 transition-colors'>
            <span className='font-mono'>[Skills]</span>
            <span className='bg-neon duration-normal absolute -bottom-1 left-0 h-px w-0 transition-all group-hover:w-full' />
          </a>
          <a href='/link' className='group text-muted-foreground hover:text-neon relative px-2 py-1 transition-colors'>
            <span className='font-mono'>[Link]</span>
            <span className='bg-neon duration-normal absolute -bottom-1 left-0 h-px w-0 transition-all group-hover:w-full' />
          </a>
          <a href='/sys' className='group text-muted-foreground hover:text-neon relative px-2 py-1 transition-colors'>
            <span className='font-mono'>[Sys]</span>
            <span className='bg-neon duration-normal absolute -bottom-1 left-0 h-px w-0 transition-all group-hover:w-full' />
          </a>
        </div>
        <div className='text-subtle-foreground mt-4 flex items-center gap-2 text-xs'>
          <kbd className='border-line rounded border px-1.5 py-0.5 font-mono text-[10px]'>1</kbd>
          <kbd className='border-line rounded border px-1.5 py-0.5 font-mono text-[10px]'>2</kbd>
          <kbd className='border-line rounded border px-1.5 py-0.5 font-mono text-[10px]'>3</kbd>
          <kbd className='border-line rounded border px-1.5 py-0.5 font-mono text-[10px]'>4</kbd>
          <span className='ml-1'>でジャンプ</span>
        </div>
      </nav>
    </div>

    {/* Footer coordinates */}
    <div className='text-subtle-foreground absolute bottom-6 left-6 text-xs'>
      <span>位置: </span>
      <span>35.6762°N, 139.6503°E</span>
    </div>

    {/* Version indicator */}
    <div className='text-subtle-foreground absolute right-6 bottom-6 text-xs'>
      <span>v</span>
      <span>4.0.0</span>
    </div>
  </main>
);

const meta = preview.meta({
  component: IndexPageForStory,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    showKonami: { control: 'boolean' },
  },
  decorators: [
    Story => {
      const rootRoute = createRootRoute({
        component: Story,
      });
      const router = createRouter({
        routeTree: rootRoute,
        history: createMemoryHistory({ initialEntries: ['/'] }),
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
 * Default homepage with all content visible (no animation delays)
 */
export const Default = meta.story({
  args: {
    showKonami: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify main content
    await expect(canvas.getByText('eve0415')).toBeInTheDocument();
    await expect(canvas.getByText('エンジニア')).toBeInTheDocument();

    // Verify navigation
    await expect(canvas.getByText('[Projects]')).toBeInTheDocument();
    await expect(canvas.getByText('[Skills]')).toBeInTheDocument();
    await expect(canvas.getByText('[Link]')).toBeInTheDocument();
    await expect(canvas.getByText('[Sys]')).toBeInTheDocument();

    // Verify keyboard hint
    await expect(canvas.getByText('でジャンプ')).toBeInTheDocument();

    // Verify footer
    await expect(canvas.getByText('35.6762°N, 139.6503°E')).toBeInTheDocument();
    await expect(canvas.getByText('4.0.0')).toBeInTheDocument();
  },
});

/**
 * Static version for visual regression testing
 */
export const Static = meta.story({
  args: {
    showKonami: false,
  },
  play: async context => {
    await testAllViewports(context);

    const canvas = within(context.canvasElement);
    await expect(canvas.getByText('eve0415')).toBeInTheDocument();
  },
});

/**
 * Konami code Easter egg activated state
 */
export const KonamiActivated = meta.story({
  args: {
    showKonami: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify secret overlay
    await expect(canvas.getByText('SECRET_UNLOCKED')).toBeInTheDocument();
    await expect(canvas.getByText('// 何かを見つけた...')).toBeInTheDocument();
  },
});

/**
 * Mobile layout showing responsive design
 */
export const MobileLayout = meta.story({
  args: {
    showKonami: false,
  },
  play: async context => {
    const { setViewport } = await import('#.storybook/viewports');
    await setViewport('mobile');

    const canvas = within(context.canvasElement);

    // Content should still be visible on mobile
    await expect(canvas.getByText('eve0415')).toBeInTheDocument();
    await expect(canvas.getByText('[Projects]')).toBeInTheDocument();
  },
});
