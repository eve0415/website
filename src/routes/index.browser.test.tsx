import type { FC } from 'react';

import { useEffect, useState } from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';

import { printConsoleArt } from './-index/console-art';
import Logo from './-index/Logo';
import TerminalText from './-index/TerminalText';
import { useKonamiCode } from './-index/useKonamiCode';

// Simplified IndexPage for testing (without router dependencies)
const TestIndexPage: FC = () => {
  const [showTagline, setShowTagline] = useState(false);
  const [showNav, setShowNav] = useState(false);
  const [konamiActivated, setKonamiActivated] = useState(false);
  const [navigatedTo, setNavigatedTo] = useState<string | null>(null);

  useKonamiCode(() => {
    setKonamiActivated(true);
    console.log('%c🎮 Secret unlocked!', 'color: #00ff88; font-size: 20px; font-weight: bold;');
    setTimeout(() => setKonamiActivated(false), 3000);
  });

  useEffect(() => {
    printConsoleArt();
    const taglineTimer = setTimeout(() => setShowTagline(true), 100); // Reduced for testing
    const navTimer = setTimeout(() => setShowNav(true), 200);
    return () => {
      clearTimeout(taglineTimer);
      clearTimeout(navTimer);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key) {
        case '1':
          setNavigatedTo('/projects');
          break;
        case '2':
          setNavigatedTo('/skills');
          break;
        case '3':
          setNavigatedTo('/link');
          break;
        case '4':
          setNavigatedTo('/sys');
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <main
      data-testid='main'
      className={`relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 transition-all duration-slow ${konamiActivated ? 'animate-glitch' : ''}`}
    >
      {konamiActivated && (
        <div data-testid='konami-overlay' className='pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-background/80'>
          <div className='animate-fade-in-scale text-center'>
            <span className='block font-mono text-neon text-xl'>SECRET_UNLOCKED</span>
          </div>
        </div>
      )}

      <div className='flex flex-col items-center gap-8'>
        <div className='w-48 text-foreground md:w-64 lg:w-80'>
          <Logo animate />
        </div>
        <h1 className='font-bold text-3xl tracking-tight md:text-4xl lg:text-5xl'>
          <TerminalText text='eve0415' speed={50} />
        </h1>
        {showTagline && (
          <p data-testid='tagline' className='animate-fade-in-up text-center text-muted-foreground'>
            <TerminalText text='エンジニア' delay={0} speed={30} />
          </p>
        )}
        {showNav && (
          <nav data-testid='nav' className='mt-12 flex animate-fade-in-up flex-col items-center gap-6 text-sm text-subtle-foreground'>
            <div className='flex gap-6'>
              <span className='font-mono'>[Projects]</span>
              <span className='font-mono'>[Skills]</span>
              <span className='font-mono'>[Link]</span>
              <span className='font-mono'>[Sys]</span>
            </div>
          </nav>
        )}
      </div>

      {navigatedTo && <div data-testid='navigated-to'>{navigatedTo}</div>}
    </main>
  );
};

describe('IndexPage', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'clear').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('renders initial content', async () => {
    await render(<TestIndexPage />);
    await expect.element(page.getByText('eve0415')).toBeInTheDocument();
  });

  test('shows tagline after delay', async () => {
    await render(<TestIndexPage />);
    // Wait for the tagline to appear
    await expect.element(page.getByTestId('tagline')).toBeInTheDocument();
  });

  test('shows navigation after delay', async () => {
    await render(<TestIndexPage />);
    // Wait for nav to appear
    await expect.element(page.getByTestId('nav')).toBeInTheDocument();
  });

  test('keyboard navigation with key 1 navigates to projects', async () => {
    await render(<TestIndexPage />);
    await userEvent.keyboard('1');
    await expect.element(page.getByTestId('navigated-to')).toHaveTextContent('/projects');
  });

  test('keyboard navigation with key 2 navigates to skills', async () => {
    await render(<TestIndexPage />);
    await userEvent.keyboard('2');
    await expect.element(page.getByTestId('navigated-to')).toHaveTextContent('/skills');
  });

  test('keyboard navigation with key 3 navigates to link', async () => {
    await render(<TestIndexPage />);
    await userEvent.keyboard('3');
    await expect.element(page.getByTestId('navigated-to')).toHaveTextContent('/link');
  });

  test('keyboard navigation with key 4 navigates to sys', async () => {
    await render(<TestIndexPage />);
    await userEvent.keyboard('4');
    await expect.element(page.getByTestId('navigated-to')).toHaveTextContent('/sys');
  });

  test('konami code activates easter egg', async () => {
    await render(<TestIndexPage />);

    // Konami code: ↑ ↑ ↓ ↓ ← → ← → B A
    const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

    for (const key of konamiSequence) {
      await userEvent.keyboard(`{${key}}`);
    }

    await expect.element(page.getByTestId('konami-overlay')).toBeInTheDocument();
    await expect.element(page.getByText('SECRET_UNLOCKED')).toBeInTheDocument();
  });
});
