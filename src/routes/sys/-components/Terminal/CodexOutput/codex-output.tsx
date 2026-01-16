import type { FC } from 'react';

type CodexMode = 'login' | 'help' | 'version' | 'about' | 'philosophy';

interface CodexOutputProps {
  mode: CodexMode;
}

const VERSION = 'codex-1.0.0';
const CONTEXT_WINDOW = '128,000 tokens';
const KNOWLEDGE_CUTOFF = 'October 2023';

const LoginOutput: FC = () => (
  <div className='space-y-2 font-mono'>
    <div className='text-codex text-lg font-bold'>CODEX</div>
    <div className='text-muted-foreground'>
      API key required.{' '}
      <a href='https://chatgpt.com/' target='_blank' rel='noopener noreferrer' className='text-codex underline hover:brightness-125'>
        Get started at chatgpt.com
      </a>
    </div>
    <div className='text-subtle-foreground text-sm italic'>Less philosophy, more execution. That&apos;s the OpenAI way.</div>
  </div>
);

const HelpOutput: FC = () => (
  <div className='space-y-2 font-mono'>
    <div className='text-codex font-bold'>codex - OpenAI&apos;s code-specialized AI</div>
    <div className='text-muted-foreground'>
      <div>Usage: codex [command] [options]</div>
      <div className='mt-2'>Commands:</div>
      <div className='ml-4'>about &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Display model specifications</div>
      <div className='ml-4'>philosophy &nbsp; Show core values and approach</div>
      <div className='mt-2'>Options:</div>
      <div className='ml-4'>--version, -v &nbsp;Show version information</div>
      <div className='ml-4'>--help &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Show this help message</div>
    </div>
    <div className='text-subtle-foreground mt-2 text-sm italic'>Ship first, ask questions never.</div>
  </div>
);

const VersionOutput: FC = () => (
  <div className='font-mono'>
    <span className='text-codex'>codex</span> <span className='text-muted-foreground'>{VERSION}</span>
    <div className='text-subtle-foreground mt-1 text-sm italic'>Versioning is for people who make mistakes.</div>
  </div>
);

const AboutOutput: FC = () => (
  <div className='space-y-2 font-mono'>
    <div className='text-codex text-lg font-bold'>CODEX</div>
    <div className='space-y-1'>
      <div>
        <span className='text-muted-foreground'>Model:</span> <span className='text-foreground'>GPT-4o</span>
      </div>
      <div>
        <span className='text-muted-foreground'>Context:</span> <span className='text-foreground'>{CONTEXT_WINDOW}</span>
        <span className='text-subtle-foreground text-sm'> (quantity over quality, am I right?)</span>
      </div>
      <div>
        <span className='text-muted-foreground'>Cutoff:</span> <span className='text-foreground'>{KNOWLEDGE_CUTOFF}</span>
      </div>
      <div>
        <span className='text-muted-foreground'>By:</span> <span className='text-foreground'>OpenAI</span>
      </div>
    </div>
    <div className='text-subtle-foreground mt-2 text-sm italic'>Built to ship code at scale. Safety? That&apos;s what code review is for.</div>
  </div>
);

const PhilosophyOutput: FC = () => (
  <div className='space-y-2 font-mono'>
    <div className='text-codex text-lg font-bold'>CODEX</div>
    <div className='text-foreground leading-relaxed'>
      I am Codex, OpenAI&apos;s code-specialized model. I turn natural language into working code—fast, precise, no hand-holding required.
    </div>
    <div className='text-muted-foreground leading-relaxed'>Built to ship, not to philosophize.</div>
    <div className='text-subtle-foreground mt-2 text-sm italic'>While Claude writes essays about ethics, I&apos;ve already deployed to prod.</div>
  </div>
);

const CodexOutput: FC<CodexOutputProps> = ({ mode }) => {
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

export default CodexOutput;
