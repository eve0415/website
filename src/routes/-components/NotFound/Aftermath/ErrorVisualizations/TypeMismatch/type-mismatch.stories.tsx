import preview from '#.storybook/preview';
import { enableReducedMotion } from '#.storybook/viewports';

import { errorVisualizationParameters, withRouter } from '../story-factory';

import TypeMismatch from './type-mismatch';

const meta = preview.meta({
  component: TypeMismatch,
  title: 'ErrorVisualizations/TypeMismatch',
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
