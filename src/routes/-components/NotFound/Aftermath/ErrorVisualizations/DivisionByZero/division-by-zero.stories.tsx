import preview from '#.storybook/preview';
import { enableReducedMotion } from '#.storybook/viewports';

import { errorVisualizationParameters } from '../story-factory';

import DivisionByZero from './division-by-zero';

const meta = preview.meta({
  component: DivisionByZero,
  title: 'ErrorVisualizations/DivisionByZero',
  tags: ['autodocs'],
  parameters: errorVisualizationParameters,
});

export default meta;

export const Static = meta.story({
  name: 'Static',
  decorators: [
    Story => {
      enableReducedMotion();
      return <Story />;
    },
  ],
});

export const Animated = meta.story({
  name: 'Animated',
});
