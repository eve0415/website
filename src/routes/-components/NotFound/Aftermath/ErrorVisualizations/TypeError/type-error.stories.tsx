import preview from '#.storybook/preview';
import { enableReducedMotion } from '#.storybook/viewports';

import { errorVisualizationParameters } from '../story-factory';

import TypeError from './type-error';

const meta = preview.meta({
  component: TypeError,
  title: 'ErrorVisualizations/TypeError',
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
