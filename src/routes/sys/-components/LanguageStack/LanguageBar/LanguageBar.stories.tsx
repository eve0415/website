import type { LanguageStat } from '../../../-utils/github-stats';

import preview from '#.storybook/preview';

import LanguageBar from './LanguageBar';

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
