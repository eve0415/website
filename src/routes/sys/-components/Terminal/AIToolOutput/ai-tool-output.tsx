import type { FC, ReactNode } from 'react';

export type AIToolMode = 'login' | 'help' | 'version' | 'about' | 'philosophy';

/**
 * Per-tool content for an AI CLI parody (claude / codex / gemini).
 *
 * The three tools share an identical JSX skeleton and differ only in colour,
 * logo node, and a handful of strings — captured here so {@link AIToolOutput}
 * can render any of them.
 */
export interface AIToolConfig {
  /** Lowercase command name, e.g. `claude`. Used in the help/version lines. */
  name: string;
  /** Tailwind text-colour class for the tool's accent, e.g. `text-claude`. */
  colorClass: string;
  /** Logo node shown in login/about/philosophy (ASCII `<pre>` or text `<div>`). */
  logo: ReactNode;
  /** login: sentence before the sign-in link, e.g. `Authentication required.`. */
  authText: string;
  /** login: sign-in URL. */
  linkHref: string;
  /** login: sign-in link label. */
  linkText: string;
  /** login: italic flavour line. */
  loginFlavor: string;
  /** help: short description after the name, e.g. `Anthropic's AI assistant`. */
  tagline: string;
  /** help: italic flavour line. */
  helpFlavor: string;
  /** version: version string, e.g. `claude-opus-4-5-20251101`. */
  version: string;
  /** version: italic flavour line. */
  versionFlavor: string;
  /** about: display model name, e.g. `Claude Opus 4.5`. */
  model: string;
  /** about: context window size, e.g. `200,000 tokens`. */
  context: string;
  /** about: parenthetical note rendered after the context size (leading space included). */
  contextNote: string;
  /** about: knowledge cutoff, e.g. `May 2025`. */
  cutoff: string;
  /** about: vendor, e.g. `Anthropic`. */
  by: string;
  /** about: italic flavour line. */
  aboutFlavor: string;
  /** philosophy: primary paragraph (foreground). */
  philosophyLead: string;
  /** philosophy: secondary paragraph (muted). */
  philosophyBody: string;
  /** philosophy: italic flavour line. */
  philosophyFlavor: string;
}

interface AIToolOutputProps {
  config: AIToolConfig;
  mode: AIToolMode;
}

const LoginOutput: FC<{ config: AIToolConfig }> = ({ config }) => (
  <div className='space-y-2 font-mono'>
    {config.logo}
    <div className='text-muted-foreground'>
      {config.authText}{' '}
      <a href={config.linkHref} target='_blank' rel='noopener noreferrer' className={`${config.colorClass} underline hover:brightness-125`}>
        {config.linkText}
      </a>
    </div>
    <div className='text-subtle-foreground text-sm italic'>{config.loginFlavor}</div>
  </div>
);

const HelpOutput: FC<{ config: AIToolConfig }> = ({ config }) => (
  <div className='space-y-2 font-mono'>
    <div className={`${config.colorClass} font-bold`}>
      {config.name} - {config.tagline}
    </div>
    <div className='text-muted-foreground'>
      <div>Usage: {config.name} [command] [options]</div>
      <div className='mt-2'>Commands:</div>
      <div className='ml-4'>about &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Display model specifications</div>
      <div className='ml-4'>philosophy &nbsp; Show core values and approach</div>
      <div className='mt-2'>Options:</div>
      <div className='ml-4'>--version, -v &nbsp;Show version information</div>
      <div className='ml-4'>--help &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Show this help message</div>
    </div>
    <div className='text-subtle-foreground mt-2 text-sm italic'>{config.helpFlavor}</div>
  </div>
);

const VersionOutput: FC<{ config: AIToolConfig }> = ({ config }) => (
  <div className='font-mono'>
    <span className={config.colorClass}>{config.name}</span> <span className='text-muted-foreground'>{config.version}</span>
    <div className='text-subtle-foreground mt-1 text-sm italic'>{config.versionFlavor}</div>
  </div>
);

const AboutOutput: FC<{ config: AIToolConfig }> = ({ config }) => (
  <div className='space-y-2 font-mono'>
    {config.logo}
    <div className='space-y-1'>
      <div>
        <span className='text-muted-foreground'>Model:</span> <span className='text-foreground'>{config.model}</span>
      </div>
      <div>
        <span className='text-muted-foreground'>Context:</span> <span className='text-foreground'>{config.context}</span>
        <span className='text-subtle-foreground text-sm'>{config.contextNote}</span>
      </div>
      <div>
        <span className='text-muted-foreground'>Cutoff:</span> <span className='text-foreground'>{config.cutoff}</span>
      </div>
      <div>
        <span className='text-muted-foreground'>By:</span> <span className='text-foreground'>{config.by}</span>
      </div>
    </div>
    <div className='text-subtle-foreground mt-2 text-sm italic'>{config.aboutFlavor}</div>
  </div>
);

const PhilosophyOutput: FC<{ config: AIToolConfig }> = ({ config }) => (
  <div className='space-y-2 font-mono'>
    {config.logo}
    <div className='text-foreground leading-relaxed'>{config.philosophyLead}</div>
    <div className='text-muted-foreground leading-relaxed'>{config.philosophyBody}</div>
    <div className='text-subtle-foreground mt-2 text-sm italic'>{config.philosophyFlavor}</div>
  </div>
);

/**
 * Renders one of the five AI-CLI parody screens (login / help / version /
 * about / philosophy) for a given tool config.
 */
const AIToolOutput: FC<AIToolOutputProps> = ({ config, mode }) => {
  switch (mode) {
    case 'login':
      return <LoginOutput config={config} />;
    case 'help':
      return <HelpOutput config={config} />;
    case 'version':
      return <VersionOutput config={config} />;
    case 'about':
      return <AboutOutput config={config} />;
    case 'philosophy':
      return <PhilosophyOutput config={config} />;
  }
};

export default AIToolOutput;
