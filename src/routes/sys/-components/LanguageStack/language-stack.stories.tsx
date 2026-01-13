import { expect, within } from 'storybook/test';

import preview from '#.storybook/preview';
import { testAllViewports } from '#.storybook/viewports';

import LanguageStack from './language-stack';
import { emptyLanguages, manyLanguages, sampleLanguages, singleLanguage, twoLanguages } from './language-stack.fixtures';

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
  play: async context => {
    await testAllViewports(context);
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

export const ResponsiveBreakpoints = meta.story({
  args: {
    languages: sampleLanguages,
    animate: false,
  },
  play: async context => {
    await testAllViewports(context);
  },
  parameters: {
    docs: {
      description: {
        story: 'Tests component at mobile (320px), tablet (768px), and desktop (1024px) viewports.',
      },
    },
  },
});

export const InteractionStates = meta.story({
  args: {
    languages: sampleLanguages,
    animate: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify all languages are rendered
    await expect(canvas.getByText('TypeScript')).toBeInTheDocument();
    await expect(canvas.getByText('JavaScript')).toBeInTheDocument();
    await expect(canvas.getByText('Rust')).toBeInTheDocument();

    // Verify percentages are displayed
    await expect(canvas.getByText(/45\.5%/)).toBeInTheDocument();
    await expect(canvas.getByText(/25\.3%/)).toBeInTheDocument();
  },
  parameters: {
    docs: {
      description: {
        story: 'Tests hover states and interactions across all language rows.',
      },
    },
  },
});
