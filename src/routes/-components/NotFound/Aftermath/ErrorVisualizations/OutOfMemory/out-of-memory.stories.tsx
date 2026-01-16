import preview from '#.storybook/preview';
import { enableReducedMotion } from '#.storybook/viewports';

import { errorVisualizationParameters, withRouter } from '../story-factory';

import OutOfMemory from './out-of-memory';

const meta = preview.meta({
  component: OutOfMemory,
  title: 'ErrorVisualizations/OutOfMemory',
  tags: ['autodocs'],
  parameters: errorVisualizationParameters,
  decorators: [withRouter],
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
