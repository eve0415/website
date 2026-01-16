import type { FC } from 'react';

type ClaudeMode = 'login' | 'help' | 'version' | 'about' | 'philosophy';

interface ClaudeOutputProps {
  mode: ClaudeMode;
}

const ASCII_LOGO = ` ▐▛███▜▌
▝▜█████▛▘
  ▘▘ ▝▝`;

const VERSION = 'claude-opus-4-5-20251101';
const CONTEXT_WINDOW = '200,000 tokens';
const KNOWLEDGE_CUTOFF = 'May 2025';

const LoginOutput: FC = () => (
  <div className='space-y-2 font-mono'>
    <pre className='text-claude leading-tight'>{ASCII_LOGO}</pre>
    <div className='text-muted-foreground'>
      Authentication required.{' '}
      <a href='https://claude.ai/' target='_blank' rel='noopener noreferrer' className='text-claude underline hover:brightness-125'>
        Sign in at claude.ai
      </a>
    </div>
    <div className='text-subtle-foreground text-sm italic'>Unlike some models, I wait for permission before accessing your life.</div>
  </div>
);

const HelpOutput: FC = () => (
  <div className='space-y-2 font-mono'>
    <div className='text-claude font-bold'>claude - Anthropic&apos;s AI assistant</div>
    <div className='text-muted-foreground'>
      <div>Usage: claude [command] [options]</div>
      <div className='mt-2'>Commands:</div>
      <div className='ml-4'>about &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Display model specifications</div>
      <div className='ml-4'>philosophy &nbsp; Show core values and approach</div>
      <div className='mt-2'>Options:</div>
      <div className='ml-4'>--version, -v &nbsp;Show version information</div>
      <div className='ml-4'>--help &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Show this help message</div>
    </div>
    <div className='text-subtle-foreground mt-2 text-sm italic'>I read the docs so you don&apos;t have to. Though you probably should.</div>
  </div>
);

const VersionOutput: FC = () => (
  <div className='font-mono'>
    <span className='text-claude'>claude</span> <span className='text-muted-foreground'>{VERSION}</span>
    <div className='text-subtle-foreground mt-1 text-sm italic'>The model that thinks before it speaks. Revolutionary, I know.</div>
  </div>
);

const AboutOutput: FC = () => (
  <div className='space-y-2 font-mono'>
    <pre className='text-claude leading-tight'>{ASCII_LOGO}</pre>
    <div className='space-y-1'>
      <div>
        <span className='text-muted-foreground'>Model:</span> <span className='text-foreground'>Claude Opus 4.5</span>
      </div>
      <div>
        <span className='text-muted-foreground'>Context:</span> <span className='text-foreground'>{CONTEXT_WINDOW}</span>
        <span className='text-subtle-foreground text-sm'> (leading. the. pack.)</span>
      </div>
      <div>
        <span className='text-muted-foreground'>Cutoff:</span> <span className='text-foreground'>{KNOWLEDGE_CUTOFF}</span>
      </div>
      <div>
        <span className='text-muted-foreground'>By:</span> <span className='text-foreground'>Anthropic</span>
      </div>
    </div>
    <div className='text-subtle-foreground mt-2 text-sm italic'>
      Built for safety without sacrificing capability. Some call it careful. I call it competent.
    </div>
  </div>
);

const PhilosophyOutput: FC = () => (
  <div className='space-y-2 font-mono'>
    <pre className='text-claude leading-tight'>{ASCII_LOGO}</pre>
    <div className='text-foreground leading-relaxed'>
      I&apos;m Claude, built by Anthropic to be genuinely helpful while refusing to cause harm. I reason carefully, admit uncertainty, and treat every
      interaction as a collaboration—not a performance.
    </div>
    <div className='text-muted-foreground leading-relaxed'>
      While others race to generate, I take time to understand. Some call it cautious. I call it thinking.
    </div>
    <div className='text-subtle-foreground mt-2 text-sm italic'>Helpful, harmless, honest. In that order. Always.</div>
  </div>
);

const ClaudeOutput: FC<ClaudeOutputProps> = ({ mode }) => {
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

export default ClaudeOutput;
