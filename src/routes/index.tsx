import type { FC } from 'react';

import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { startTransition, useEffect, useState } from 'react';

import { useReducedMotion } from '#hooks/useReducedMotion';

import Background from './-index/Background/background';
import { printConsoleArt } from './-index/console-art';
import Logo from './-index/logo';
import TerminalText from './-index/terminal-text';
import { useKonamiCode } from './-index/useKonamiCode';

const IndexPage: FC = () => {
  const reducedMotion = useReducedMotion();
  const [showTagline, setShowTagline] = useState(false);
  const [showNav, setShowNav] = useState(false);
  const [konamiActivated, setKonamiActivated] = useState(false);
  const navigate = useNavigate();

  // Reveal the tagline and nav immediately for reduced-motion users so keyboard
  // users have something to Tab to without waiting out the staggered animation.
  const taglineVisible = showTagline || reducedMotion;
  const navVisible = showNav || reducedMotion;

  // Konami code Easter egg
  useKonamiCode(() => {
    setKonamiActivated(true);
    console.log('%c🎮 Secret unlocked!', 'color: #00ff88; font-size: 20px; font-weight: bold;');
    // Reset after animation
    setTimeout(() => {
      setKonamiActivated(false);
    }, 3000);
  });

  useEffect(() => {
    // Print console art on mount
    printConsoleArt();

    // Reduced-motion users get the tagline and nav immediately via derived
    // visibility, so skip the staggered reveal timers entirely.
    if (reducedMotion) return;

    // Stagger the animations
    const taglineTimer = setTimeout(() => {
      setShowTagline(true);
    }, 1500);
    const navTimer = setTimeout(() => {
      setShowNav(true);
    }, 2500);

    return () => {
      clearTimeout(taglineTimer);
      clearTimeout(navTimer);
    };
  }, [reducedMotion]);

  // Keyboard navigation
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      // Scope these single-key shortcuts to "not typing anywhere": only act when
      // focus rests on the body, never mid-IME-composition, and never while a
      // modifier is held (so browser/OS chords keep working) - WCAG 2.1.4.
      if (document.activeElement !== document.body) return;
      if (e.isComposing) return;
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      startTransition(async () => {
        switch (e.key) {
          case '1':
            await navigate({ to: '/projects' });
            break;
          case '2':
            await navigate({ to: '/skills' });
            break;
          case '3':
            await navigate({ to: '/link' });
            break;
          case '4':
            await navigate({ to: '/sys' });
            break;
        }
      });
    };

    globalThis.addEventListener('keydown', listener);

    return () => {
      globalThis.removeEventListener('keydown', listener);
    };
  }, [navigate]);

  return (
    <main
      className={`duration-slow relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 transition-all ${konamiActivated ? 'animate-glitch' : ''}`}
    >
      <Background />

      {/* Konami code secret overlay */}
      {konamiActivated && (
        <div className='bg-background/80 pointer-events-none fixed inset-0 z-50 flex items-center justify-center'>
          <div className='animate-fade-in-scale text-center'>
            <span className='text-neon block font-mono text-xl'>SECRET_UNLOCKED</span>
            {/* oxlint-disable-next-line react/jsx-no-comment-textnodes -- Decorative code comment style */}
            <span className='text-subtle-foreground mt-2 block text-sm'>// 何かを見つけた...</span>
          </div>
        </div>
      )}

      {/* Central content */}
      <div className='flex flex-col items-center gap-8'>
        {/* Logo */}
        <div className='text-foreground w-48 md:w-64 lg:w-80'>
          <Logo animate />
        </div>

        {/* Name */}
        <h1 className='text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl'>
          <TerminalText text='eve0415' speed={100} />
        </h1>

        {/* Tagline */}
        {taglineVisible && (
          <p className='animate-fade-in-up text-muted-foreground text-center'>
            <TerminalText text='エンジニア' delay={0} speed={60} />
          </p>
        )}

        {/* Navigation prompt */}
        {navVisible && (
          <nav className='animate-fade-in-up text-subtle-foreground mt-12 flex flex-col items-center gap-6 text-sm'>
            {/* oxlint-disable-next-line react/jsx-no-comment-textnodes -- Decorative code comment style */}
            <span className='font-mono text-xs tracking-wider'>// 探索を始める</span>
            <div className='flex gap-6'>
              <Link to='/projects' className='group text-muted-foreground hover:text-neon relative px-2 py-1 transition-colors'>
                <span className='font-mono'>[Projects]</span>
                <span className='bg-neon duration-normal absolute -bottom-1 left-0 h-px w-0 transition-all group-hover:w-full' />
              </Link>
              <Link to='/skills' className='group text-muted-foreground hover:text-neon relative px-2 py-1 transition-colors'>
                <span className='font-mono'>[Skills]</span>
                <span className='bg-neon duration-normal absolute -bottom-1 left-0 h-px w-0 transition-all group-hover:w-full' />
              </Link>
              <Link to='/link' className='group text-muted-foreground hover:text-neon relative px-2 py-1 transition-colors'>
                <span className='font-mono'>[Link]</span>
                <span className='bg-neon duration-normal absolute -bottom-1 left-0 h-px w-0 transition-all group-hover:w-full' />
              </Link>
              <Link to='/sys' className='group text-muted-foreground hover:text-neon relative px-2 py-1 transition-colors'>
                <span className='font-mono'>[Sys]</span>
                <span className='bg-neon duration-normal absolute -bottom-1 left-0 h-px w-0 transition-all group-hover:w-full' />
              </Link>
            </div>
            <div className='text-subtle-foreground mt-4 flex items-center gap-2 text-xs'>
              <kbd className='border-line rounded border px-1.5 py-0.5 font-mono text-[10px]'>1</kbd>
              <kbd className='border-line rounded border px-1.5 py-0.5 font-mono text-[10px]'>2</kbd>
              <kbd className='border-line rounded border px-1.5 py-0.5 font-mono text-[10px]'>3</kbd>
              <kbd className='border-line rounded border px-1.5 py-0.5 font-mono text-[10px]'>4</kbd>
              <span className='ml-1'>でジャンプ</span>
            </div>
          </nav>
        )}
      </div>

      {/* Footer coordinates - playful terminal element */}
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
};

export const Route = createFileRoute('/')({
  component: IndexPage,
  head: () => ({
    meta: [{ title: 'eve0415' }, { property: 'og:title', content: 'eve0415' }, { property: 'og:url', content: 'https://eve0415.net' }],
    links: [{ rel: 'canonical', href: 'https://eve0415.net' }],
  }),
});
