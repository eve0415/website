import preview from '#.storybook/preview';
import { enableReducedMotion } from '#.storybook/viewports';

import { errorVisualizationParameters, withRouter } from '../story-factory';

import SegFault from './seg-fault';

const meta = preview.meta({
  component: SegFault,
  title: 'ErrorVisualizations/SegFault',
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
