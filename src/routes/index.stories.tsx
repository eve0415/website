import type { FC } from 'react';

import { RouterProvider, createMemoryHistory, createRootRoute, createRouter } from '@tanstack/react-router';
import { expect, within } from 'storybook/test';

import preview from '#.storybook/preview';
import { testAllViewports } from '#.storybook/viewports';

import Background from './-index/Background/background';
import Logo from './-index/logo';

// Simplified IndexPage for Storybook (shows all content immediately, no animations)
const IndexPageForStory: FC<{ showKonami?: boolean }> = ({ showKonami = false }) => {
  return (
    <main className={`relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 ${showKonami ? 'animate-glitch' : ''}`}>
      <Background />

      {/* Konami code secret overlay */}
      {showKonami && (
        <div className='pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-background/80'>
          <div className='text-center'>
            <span className='block font-mono text-neon text-xl'>SECRET_UNLOCKED</span>
            <span className='mt-2 block text-sm text-subtle-foreground'>// 何かを見つけた...</span>
          </div>
        </div>
      )}

      {/* Central content */}
      <div className='flex flex-col items-center gap-8'>
        {/* Logo */}
        <div className='w-48 text-foreground md:w-64 lg:w-80'>
          <Logo animate={false} />
        </div>

        {/* Name */}
        <h1 className='font-bold text-3xl tracking-tight md:text-4xl lg:text-5xl'>eve0415</h1>

        {/* Tagline */}
        <p className='text-center text-muted-foreground'>エンジニア</p>

        {/* Navigation prompt */}
        <nav className='mt-12 flex flex-col items-center gap-6 text-sm text-subtle-foreground'>
          <span className='font-mono text-xs tracking-wider'>// 探索を始める</span>
          <div className='flex gap-6'>
            <a href='/projects' className='group relative px-2 py-1 text-muted-foreground transition-colors hover:text-neon'>
              <span className='font-mono'>[Projects]</span>
              <span className='absolute -bottom-1 left-0 h-px w-0 bg-neon transition-all duration-normal group-hover:w-full' />
            </a>
            <a href='/skills' className='group relative px-2 py-1 text-muted-foreground transition-colors hover:text-neon'>
              <span className='font-mono'>[Skills]</span>
              <span className='absolute -bottom-1 left-0 h-px w-0 bg-neon transition-all duration-normal group-hover:w-full' />
            </a>
            <a href='/link' className='group relative px-2 py-1 text-muted-foreground transition-colors hover:text-neon'>
              <span className='font-mono'>[Link]</span>
              <span className='absolute -bottom-1 left-0 h-px w-0 bg-neon transition-all duration-normal group-hover:w-full' />
            </a>
            <a href='/sys' className='group relative px-2 py-1 text-muted-foreground transition-colors hover:text-neon'>
              <span className='font-mono'>[Sys]</span>
              <span className='absolute -bottom-1 left-0 h-px w-0 bg-neon transition-all duration-normal group-hover:w-full' />
            </a>
          </div>
          <div className='mt-4 flex items-center gap-2 text-subtle-foreground text-xs opacity-50'>
            <kbd className='rounded border border-line px-1.5 py-0.5 font-mono text-[10px]'>1</kbd>
            <kbd className='rounded border border-line px-1.5 py-0.5 font-mono text-[10px]'>2</kbd>
            <kbd className='rounded border border-line px-1.5 py-0.5 font-mono text-[10px]'>3</kbd>
            <kbd className='rounded border border-line px-1.5 py-0.5 font-mono text-[10px]'>4</kbd>
            <span className='ml-1'>でジャンプ</span>
          </div>
        </nav>
      </div>

      {/* Footer coordinates */}
      <div className='absolute bottom-6 left-6 text-subtle-foreground text-xs'>
        <span className='opacity-50'>位置: </span>
        <span>35.6762°N, 139.6503°E</span>
      </div>

      {/* Version indicator */}
      <div className='absolute right-6 bottom-6 text-subtle-foreground text-xs'>
        <span className='opacity-50'>v</span>
        <span>4.0.0</span>
      </div>
    </main>
  );
};

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
      <div className='min-h-dvh bg-background'>
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
