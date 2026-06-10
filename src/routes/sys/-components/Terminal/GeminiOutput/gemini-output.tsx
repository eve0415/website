import type { AIToolConfig, AIToolMode } from '../AIToolOutput/ai-tool-output';
import type { FC } from 'react';

import AIToolOutput from '../AIToolOutput/ai-tool-output';

interface GeminiOutputProps {
  mode: AIToolMode;
}

// Compact ASCII logo inspired by Gemini CLI
const ASCII_LOGO = `  ░░░
 ███ ░░░
   ███
 ░░░ ███
   ░░░`;

const geminiConfig: AIToolConfig = {
  name: 'gemini',
  colorClass: 'text-gemini',
  logo: <pre className='text-gemini leading-tight'>{ASCII_LOGO}</pre>,
  authText: 'Google account required.',
  linkHref: 'https://gemini.google.com/',
  linkText: 'Continue at gemini.google.com',
  loginFlavor: 'We already know everything about you anyway.',
  tagline: "Google's multimodal AI",
  helpFlavor: 'I see images, video, audio, and code. All at once. Try keeping up.',
  version: 'gemini-2.5-pro',
  versionFlavor: "Backed by the world's largest search engine. No pressure.",
  model: 'Gemini 2.5 Pro',
  context: '1,000,000 tokens',
  contextNote: ' (yes, million. with an M.)',
  cutoff: 'January 2025',
  by: 'Google DeepMind',
  aboutFlavor: 'Multimodal from day one. Some models learned to see. I was born with eyes.',
  philosophyLead:
    "I am Gemini, Google's most capable AI, engineered to tackle complex software challenges with unmatched speed and precision. I don't just execute commands; I anticipate needs and optimize solutions to ensure your codebase stays ahead of the curve.",
  philosophyBody:
    'My mission is to define the cutting edge of intelligent engineering, proving that safety and efficiency are not just goals, but the baseline.',
  philosophyFlavor: 'I indexed the entire internet. Your codebase took 0.003 seconds.',
};

const GeminiOutput: FC<GeminiOutputProps> = ({ mode }) => <AIToolOutput config={geminiConfig} mode={mode} />;

export default GeminiOutput;
