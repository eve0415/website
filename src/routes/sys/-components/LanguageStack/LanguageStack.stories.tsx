import { expect, within } from 'storybook/test';

import preview from '#.storybook/preview';

import LanguageStack from './LanguageStack';
import { emptyLanguages, manyLanguages, sampleLanguages, singleLanguage, twoLanguages } from './LanguageStack.fixtures';

const meta = preview.meta({
  component: LanguageStack,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    animate: { control: 'boolean' },
  },
  decorators: [
    Story => (
      <div className='bg-bg-primary p-8'>
        <Story />
      </div>
    ),
  ],
});

export const Default = meta.story({
  args: {
    languages: sampleLanguages,
    animate: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('STACK_ANALYSIS')).toBeInTheDocument();
    await expect(canvas.getByText('TypeScript')).toBeInTheDocument();
  },
});

export const Animated = meta.story({
  args: {
    languages: sampleLanguages,
    animate: true,
  },
});

export const Static = meta.story({
  args: {
    languages: sampleLanguages,
    animate: false,
  },
});

export const SingleLanguage = meta.story({
  args: {
    languages: singleLanguage,
    animate: false,
  },
});

export const TwoLanguages = meta.story({
  args: {
    languages: twoLanguages,
    animate: false,
  },
});

export const ManyLanguages = meta.story({
  args: {
    languages: manyLanguages,
    animate: false,
  },
});

export const Empty = meta.story({
  args: {
    languages: emptyLanguages,
    animate: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('[NO_DATA]')).toBeInTheDocument();
  },
});
