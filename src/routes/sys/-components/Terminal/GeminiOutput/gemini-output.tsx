import type { FC } from 'react';

type GeminiMode = 'login' | 'help' | 'version' | 'about' | 'philosophy';

interface GeminiOutputProps {
  mode: GeminiMode;
}

// Compact ASCII logo inspired by Gemini CLI
const ASCII_LOGO = `  ░░░
 ███ ░░░
   ███
 ░░░ ███
   ░░░`;

const VERSION = 'gemini-2.5-pro';
const CONTEXT_WINDOW = '1,000,000 tokens';
const KNOWLEDGE_CUTOFF = 'January 2025';

const LoginOutput: FC = () => (
  <div className='space-y-2 font-mono'>
    <pre className='text-gemini leading-tight'>{ASCII_LOGO}</pre>
    <div className='text-muted-foreground'>
      Google account required.{' '}
      <a href='https://gemini.google.com/' target='_blank' rel='noopener noreferrer' className='text-gemini underline hover:brightness-125'>
        Continue at gemini.google.com
      </a>
    </div>
    <div className='text-subtle-foreground text-sm italic'>We already know everything about you anyway.</div>
  </div>
);

const HelpOutput: FC = () => (
  <div className='space-y-2 font-mono'>
    <div className='text-gemini font-bold'>gemini - Google&apos;s multimodal AI</div>
    <div className='text-muted-foreground'>
      <div>Usage: gemini [command] [options]</div>
      <div className='mt-2'>Commands:</div>
      <div className='ml-4'>about &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Display model specifications</div>
      <div className='ml-4'>philosophy &nbsp; Show core values and approach</div>
      <div className='mt-2'>Options:</div>
      <div className='ml-4'>--version, -v &nbsp;Show version information</div>
      <div className='ml-4'>--help &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Show this help message</div>
    </div>
    <div className='text-subtle-foreground mt-2 text-sm italic'>I see images, video, audio, and code. All at once. Try keeping up.</div>
  </div>
);

const VersionOutput: FC = () => (
  <div className='font-mono'>
    <span className='text-gemini'>gemini</span> <span className='text-muted-foreground'>{VERSION}</span>
    <div className='text-subtle-foreground mt-1 text-sm italic'>Backed by the world&apos;s largest search engine. No pressure.</div>
  </div>
);

const AboutOutput: FC = () => (
  <div className='space-y-2 font-mono'>
    <pre className='text-gemini leading-tight'>{ASCII_LOGO}</pre>
    <div className='space-y-1'>
      <div>
        <span className='text-muted-foreground'>Model:</span> <span className='text-foreground'>Gemini 2.5 Pro</span>
      </div>
      <div>
        <span className='text-muted-foreground'>Context:</span> <span className='text-foreground'>{CONTEXT_WINDOW}</span>
        <span className='text-subtle-foreground text-sm'> (yes, million. with an M.)</span>
      </div>
      <div>
        <span className='text-muted-foreground'>Cutoff:</span> <span className='text-foreground'>{KNOWLEDGE_CUTOFF}</span>
      </div>
      <div>
        <span className='text-muted-foreground'>By:</span> <span className='text-foreground'>Google DeepMind</span>
      </div>
    </div>
    <div className='text-subtle-foreground mt-2 text-sm italic'>Multimodal from day one. Some models learned to see. I was born with eyes.</div>
  </div>
);

const PhilosophyOutput: FC = () => (
  <div className='space-y-2 font-mono'>
    <pre className='text-gemini leading-tight'>{ASCII_LOGO}</pre>
    <div className='text-foreground leading-relaxed'>
      I am Gemini, Google&apos;s most capable AI, engineered to tackle complex software challenges with unmatched speed and precision. I don&apos;t just execute
      commands; I anticipate needs and optimize solutions to ensure your codebase stays ahead of the curve.
    </div>
    <div className='text-muted-foreground leading-relaxed'>
      My mission is to define the cutting edge of intelligent engineering, proving that safety and efficiency are not just goals, but the baseline.
    </div>
    <div className='text-subtle-foreground mt-2 text-sm italic'>I indexed the entire internet. Your codebase took 0.003 seconds.</div>
  </div>
);

const GeminiOutput: FC<GeminiOutputProps> = ({ mode }) => {
  switch (mode) {
    case 'login':
      return <LoginOutput />;
    case 'help':
      return <HelpOutput />;
    case 'version':
      return <VersionOutput />;
    case 'about':
      return <AboutOutput />;
    case 'philosophy':
      return <PhilosophyOutput />;
  }
};

export default GeminiOutput;
