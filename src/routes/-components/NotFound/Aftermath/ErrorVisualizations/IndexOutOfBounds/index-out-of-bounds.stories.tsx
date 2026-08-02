import preview from '#.storybook/preview';
import { enableReducedMotion } from '#.storybook/viewports';

import { errorVisualizationParameters } from '../story-factory';

import IndexOutOfBounds from './index-out-of-bounds';

const meta = preview.meta({
  component: IndexOutOfBounds,
  title: 'ErrorVisualizations/IndexOutOfBounds',
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
