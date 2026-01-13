import { expect, within } from 'storybook/test';

import preview from '#.storybook/preview';
import { testAllViewports } from '#.storybook/viewports';

import ProgressBar from './progress-bar';

const meta = preview.meta({
  component: ProgressBar,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [
    Story => (
      <div className='border-line/50 bg-surface/90 w-96 rounded-lg border'>
        <Story />
      </div>
    ),
  ],
});

// --- Progress Percentage Stories ---

export const Empty = meta.story({
  args: {
    stageLabel: 'Network',
    progress: 0,
  },
  play: async context => {
    const canvas = within(context.canvasElement);

    await expect(canvas.getByTestId('stage-label')).toHaveTextContent('Network');
    await expect(canvas.getByTestId('percentage')).toHaveTextContent('0%');

    const fill = canvas.getByTestId('progress-fill');
    await expect(fill).toHaveAttribute('style', 'width: 0%;');

    await testAllViewports(context);
  },
});

export const Quarter = meta.story({
  args: {
    stageLabel: 'TLS',
    progress: 0.25,
  },
  play: async context => {
    const canvas = within(context.canvasElement);

    await expect(canvas.getByTestId('stage-label')).toHaveTextContent('TLS');
    await expect(canvas.getByTestId('percentage')).toHaveTextContent('25%');

    const fill = canvas.getByTestId('progress-fill');
    await expect(fill).toHaveAttribute('style', 'width: 25%;');

    await testAllViewports(context);
  },
});

export const Half = meta.story({
  args: {
    stageLabel: 'HTTP',
    progress: 0.5,
  },
  play: async context => {
    const canvas = within(context.canvasElement);

    await expect(canvas.getByTestId('stage-label')).toHaveTextContent('HTTP');
    await expect(canvas.getByTestId('percentage')).toHaveTextContent('50%');

    const fill = canvas.getByTestId('progress-fill');
    await expect(fill).toHaveAttribute('style', 'width: 50%;');

    await testAllViewports(context);
  },
});

export const ThreeQuarters = meta.story({
  args: {
    stageLabel: 'Render',
    progress: 0.75,
  },
  play: async context => {
    const canvas = within(context.canvasElement);

    await expect(canvas.getByTestId('stage-label')).toHaveTextContent('Render');
    await expect(canvas.getByTestId('percentage')).toHaveTextContent('75%');

    const fill = canvas.getByTestId('progress-fill');
    await expect(fill).toHaveAttribute('style', 'width: 75%;');

    await testAllViewports(context);
  },
});

export const Full = meta.story({
  args: {
    stageLabel: 'Hydrate',
    progress: 1,
  },
  play: async context => {
    const canvas = within(context.canvasElement);

    await expect(canvas.getByTestId('stage-label')).toHaveTextContent('Hydrate');
    await expect(canvas.getByTestId('percentage')).toHaveTextContent('100%');

    const fill = canvas.getByTestId('progress-fill');
    await expect(fill).toHaveAttribute('style', 'width: 100%;');

    await testAllViewports(context);
  },
});

// --- Stage Label Stories ---

export const NetworkStage = meta.story({
  args: {
    stageLabel: 'Network',
    progress: 0.3,
  },
  play: async context => {
    const canvas = within(context.canvasElement);
    await expect(canvas.getByTestId('stage-label')).toHaveTextContent('Network');
    await testAllViewports(context);
  },
});

export const TLSStage = meta.story({
  args: {
    stageLabel: 'TLS',
    progress: 0.6,
  },
  play: async context => {
    const canvas = within(context.canvasElement);
    await expect(canvas.getByTestId('stage-label')).toHaveTextContent('TLS');
    await testAllViewports(context);
  },
});

export const ParseStage = meta.story({
  args: {
    stageLabel: 'Parse',
    progress: 0.45,
  },
  play: async context => {
    const canvas = within(context.canvasElement);
    await expect(canvas.getByTestId('stage-label')).toHaveTextContent('Parse');
    await testAllViewports(context);
  },
});

export const ResourcesStage = meta.story({
  args: {
    stageLabel: 'Resources',
    progress: 0.8,
  },
  play: async context => {
    const canvas = within(context.canvasElement);
    await expect(canvas.getByTestId('stage-label')).toHaveTextContent('Resources');
    await testAllViewports(context);
  },
});

export const HydrateStage = meta.story({
  args: {
    stageLabel: 'Hydrate',
    progress: 0.95,
  },
  play: async context => {
    const canvas = within(context.canvasElement);
    await expect(canvas.getByTestId('stage-label')).toHaveTextContent('Hydrate');
    await testAllViewports(context);
  },
});
