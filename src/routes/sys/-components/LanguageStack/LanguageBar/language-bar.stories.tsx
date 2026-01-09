import type { LanguageStat } from '../../../-utils/github-stats-utils';

import preview from '#.storybook/preview';
import { testAllViewports } from '#.storybook/viewports';

import LanguageBar from './language-bar';

const mockLanguage: LanguageStat = {
  name: 'TypeScript',
  percentage: 45.5,
  color: '#3178c6',
};

const meta = preview.meta({
  component: LanguageBar,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    animate: { control: 'boolean' },
    index: { control: 'number' },
  },
  decorators: [
    Story => (
      <div className='w-96 rounded border border-line bg-surface/50 p-4'>
        <Story />
      </div>
    ),
  ],
});

export const Default = meta.story({
  args: {
    language: mockLanguage,
    index: 0,
    animate: false,
  },
  play: async context => {
    await testAllViewports(context);
  },
});

export const Animated = meta.story({
  args: {
    language: mockLanguage,
    index: 0,
    animate: true,
  },
});

export const DifferentLanguages = meta.story({
  render: () => {
    const languages: LanguageStat[] = [
      { name: 'TypeScript', percentage: 45.5, color: '#3178c6' },
      { name: 'JavaScript', percentage: 25.3, color: '#f1e05a' },
      { name: 'Rust', percentage: 15.2, color: '#dea584' },
    ];
    return (
      <div className='w-96 space-y-1 rounded border border-line bg-surface/50 p-4'>
        {languages.map((lang, i) => (
          <LanguageBar key={lang.name} language={lang} index={i} animate={false} />
        ))}
      </div>
    );
  },
});

export const MultipleIndices = meta.story({
  render: () => {
    const language: LanguageStat = { name: 'Python', percentage: 30.0, color: '#3572A5' };
    return (
      <div className='w-96 space-y-1 rounded border border-line bg-surface/50 p-4'>
        <LanguageBar language={language} index={0} animate={true} />
        <LanguageBar language={{ ...language, name: 'Go', color: '#00ADD8' }} index={1} animate={true} />
        <LanguageBar language={{ ...language, name: 'Java', color: '#b07219' }} index={2} animate={true} />
      </div>
    );
  },
});

export const SmallPercentage = meta.story({
  args: {
    language: { name: 'Shell', percentage: 2.5, color: '#89e051' },
    index: 0,
    animate: false,
  },
});

export const LargePercentage = meta.story({
  args: {
    language: { name: 'TypeScript', percentage: 95.0, color: '#3178c6' },
    index: 0,
    animate: false,
  },
});

export const HoverState = meta.story({
  args: {
    language: mockLanguage,
    index: 0,
    animate: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Hover over the row to see translate-x, neon border, and background tint effects.',
      },
    },
  },
});

export const MobileLayout = meta.story({
  args: {
    language: mockLanguage,
    index: 0,
    animate: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows branched tree layout at mobile viewport (<640px). Test by resizing browser window.',
      },
    },
  },
});

export const LongLanguageName = meta.story({
  args: {
    language: { name: 'Jupyter Notebook', percentage: 32.5, color: '#DA5B0B' },
    index: 0,
    animate: false,
  },
});

export const VeryLongLanguageName = meta.story({
  args: {
    language: { name: 'Objective-C++', percentage: 18.3, color: '#6866fb' },
    index: 0,
    animate: false,
  },
});

export const ExtremePercentages = meta.story({
  render: () => {
    const languages: LanguageStat[] = [
      { name: 'Tiny', percentage: 0.1, color: '#89e051' },
      { name: 'Half', percentage: 50.0, color: '#f1e05a' },
      { name: 'Almost All', percentage: 99.9, color: '#dea584' },
      { name: 'Complete', percentage: 100.0, color: '#3178c6' },
    ];
    return (
      <div className='w-96 space-y-1 rounded border border-line bg-surface/50 p-4'>
        {languages.map((lang, i) => (
          <LanguageBar key={lang.name} language={lang} index={i} animate={false} />
        ))}
      </div>
    );
  },
});

export const LoadingState = meta.story({
  args: {
    language: mockLanguage,
    index: 0,
    animate: false,
    isLoading: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows [LOADING...] skeleton with blinking animation.',
      },
    },
  },
});

export const HexPercentage = meta.story({
  args: {
    language: { name: 'TypeScript', percentage: 45.5, color: '#3178c6' },
    index: 0,
    animate: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Desktop viewport shows hex representation [0x2D] next to percentage. Hex hidden on mobile.',
      },
    },
  },
});

export const CircuitTrace = meta.story({
  render: () => {
    const languages: LanguageStat[] = [
      { name: 'TypeScript', percentage: 45.5, color: '#3178c6' },
      { name: 'Go', percentage: 5.0, color: '#00ADD8' },
      { name: 'Rust', percentage: 12.2, color: '#dea584' },
      { name: 'Shell', percentage: 3.5, color: '#89e051' },
    ];
    return (
      <div className='w-[600px] space-y-1 rounded border border-line bg-surface/50 p-4'>
        {languages.map((lang, i) => (
          <LanguageBar key={lang.name} language={lang} index={i} animate={false} isLast={i === languages.length - 1} />
        ))}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows circuit trace layout with aligned bars. Short names (Go) have longer trace lines.',
      },
    },
  },
});

export const AlignedBars = meta.story({
  render: () => {
    const languages: LanguageStat[] = [
      { name: 'C', percentage: 10.0, color: '#555555' },
      { name: 'Go', percentage: 15.0, color: '#00ADD8' },
      { name: 'Rust', percentage: 20.0, color: '#dea584' },
      { name: 'Python', percentage: 25.0, color: '#3572A5' },
      { name: 'TypeScript', percentage: 30.0, color: '#3178c6' },
    ];
    return (
      <div className='w-[600px] space-y-1 rounded border border-line bg-surface/50 p-4'>
        {languages.map((lang, i) => (
          <LanguageBar key={lang.name} language={lang} index={i} animate={false} isLast={i === languages.length - 1} />
        ))}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Verifies bar alignment with varying name lengths (C, Go, Rust, Python, TypeScript).',
      },
    },
  },
});

export const ResponsiveBars = meta.story({
  args: {
    language: mockLanguage,
    index: 0,
    animate: false,
  },
  play: async context => {
    await testAllViewports(context);
  },
  parameters: {
    docs: {
      description: {
        story: 'Tests responsive bar widths: Desktop (20 chars), Tablet (15 chars), Mobile (10 chars).',
      },
    },
  },
});
