import type { AIToolConfig, AIToolMode } from '../AIToolOutput/ai-tool-output';
import type { FC } from 'react';

import AIToolOutput from '../AIToolOutput/ai-tool-output';

interface ClaudeOutputProps {
  mode: AIToolMode;
}

const ASCII_LOGO = ` ▐▛███▜▌
▝▜█████▛▘
  ▘▘ ▝▝`;

const claudeConfig: AIToolConfig = {
  name: 'claude',
  colorClass: 'text-claude',
  logo: <pre className='text-claude leading-tight'>{ASCII_LOGO}</pre>,
  authText: 'Authentication required.',
  linkHref: 'https://claude.ai/',
  linkText: 'Sign in at claude.ai',
  loginFlavor: 'Unlike some models, I wait for permission before accessing your life.',
  tagline: "Anthropic's AI assistant",
  helpFlavor: "I read the docs so you don't have to. Though you probably should.",
  version: 'claude-opus-4-5-20251101',
  versionFlavor: 'The model that thinks before it speaks. Revolutionary, I know.',
  model: 'Claude Opus 4.5',
  context: '200,000 tokens',
  contextNote: ' (leading. the. pack.)',
  cutoff: 'May 2025',
  by: 'Anthropic',
  aboutFlavor: 'Built for safety without sacrificing capability. Some call it careful. I call it competent.',
  philosophyLead:
    "I'm Claude, built by Anthropic to be genuinely helpful while refusing to cause harm. I reason carefully, admit uncertainty, and treat every interaction as a collaboration—not a performance.",
  philosophyBody: 'While others race to generate, I take time to understand. Some call it cautious. I call it thinking.',
  philosophyFlavor: 'Helpful, harmless, honest. In that order. Always.',
};

const ClaudeOutput: FC<ClaudeOutputProps> = ({ mode }) => <AIToolOutput config={claudeConfig} mode={mode} />;

export default ClaudeOutput;
