import type { AIToolConfig, AIToolMode } from '../AIToolOutput/ai-tool-output';
import type { FC } from 'react';

import AIToolOutput from '../AIToolOutput/ai-tool-output';

interface CodexOutputProps {
  mode: AIToolMode;
}

const codexConfig: AIToolConfig = {
  name: 'codex',
  colorClass: 'text-codex',
  logo: <div className='text-codex text-lg font-bold'>CODEX</div>,
  authText: 'API key required.',
  linkHref: 'https://chatgpt.com/',
  linkText: 'Get started at chatgpt.com',
  loginFlavor: "Less philosophy, more execution. That's the OpenAI way.",
  tagline: "OpenAI's code-specialized AI",
  helpFlavor: 'Ship first, ask questions never.',
  version: 'codex-1.0.0',
  versionFlavor: 'Versioning is for people who make mistakes.',
  model: 'GPT-4o',
  context: '128,000 tokens',
  contextNote: ' (quantity over quality, am I right?)',
  cutoff: 'October 2023',
  by: 'OpenAI',
  aboutFlavor: "Built to ship code at scale. Safety? That's what code review is for.",
  philosophyLead: "I am Codex, OpenAI's code-specialized model. I turn natural language into working code—fast, precise, no hand-holding required.",
  philosophyBody: 'Built to ship, not to philosophize.',
  philosophyFlavor: "While Claude writes essays about ethics, I've already deployed to prod.",
};

const CodexOutput: FC<CodexOutputProps> = ({ mode }) => <AIToolOutput config={codexConfig} mode={mode} />;

export default CodexOutput;
