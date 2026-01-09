import type { MouseInfluence } from '../useMouseInfluence';

import { expect, within } from 'storybook/test';

import preview from '#.storybook/preview';
import { testAllViewports } from '#.storybook/viewports';

import CorruptionOverlay from './corruption-overlay';

// Default mouse influence for stories (centered, no movement)
const defaultMouseInfluence: MouseInfluence = {
  position: { x: 400, y: 300 },
  velocity: { x: 0, y: 0 },
  normalizedPosition: { x: 0.5, y: 0.5 },
  glowIntensity: 0.5,
  disruptionRadius: 120,
  pullStrength: 0,
  repelForce: 0,
};

const meta = preview.meta({
  component: CorruptionOverlay,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    Story => (
      <div className='relative h-screen w-full bg-background'>
        <Story />
      </div>
    ),
  ],
});

// --- Progress Stories ---

export const EarlyCorruption = meta.story({
  args: {
    progress: 0.15,
    mouseInfluence: defaultMouseInfluence,
    visible: true,
  },
  play: async context => {
    const canvas = within(context.canvasElement);

    // Should show early stage errors
    await expect(canvas.getByText(/ENOENT.*no such file or directory/)).toBeInTheDocument();

    await testAllViewports(context);
  },
});

export const MidCorruption = meta.story({
  args: {
    progress: 0.5,
    mouseInfluence: defaultMouseInfluence,
    visible: true,
  },
  play: async context => {
    const canvas = within(context.canvasElement);

    // Should show multiple errors
    await expect(canvas.getByText(/ENOENT/)).toBeInTheDocument();
    await expect(canvas.getByText(/TypeError/)).toBeInTheDocument();

    await testAllViewports(context);
  },
});

export const LateCorruption = meta.story({
  args: {
    progress: 0.95,
    mouseInfluence: defaultMouseInfluence,
    visible: true,
  },
  play: async context => {
    const canvas = within(context.canvasElement);

    // Should show catastrophic errors (use specific text to avoid matching stack trace)
    await expect(canvas.getByText(/Segmentation fault \(core dumped\)/)).toBeInTheDocument();

    await testAllViewports(context);
  },
});

export const FullCorruption = meta.story({
  args: {
    progress: 1.0,
    mouseInfluence: defaultMouseInfluence,
    visible: true,
  },
  play: async context => {
    const canvas = within(context.canvasElement);

    // Should show all errors including kernel panic
    await expect(canvas.getByText(/ENOENT/)).toBeInTheDocument();
    await expect(canvas.getByText(/Kernel panic/)).toBeInTheDocument();

    await testAllViewports(context);
  },
});

export const NotVisible = meta.story({
  args: {
    progress: 0.5,
    mouseInfluence: defaultMouseInfluence,
    visible: false,
  },
  play: async context => {
    const canvas = within(context.canvasElement);

    // Should render nothing when not visible
    const errors = canvas.queryByText(/ENOENT|TypeError|NullPointer/);
    await expect(errors).toBeNull();

    // Skip viewport testing - component returns null when not visible
  },
});

// --- Mouse Influence Stories ---

export const WithMouseDisruption = meta.story({
  args: {
    progress: 0.7,
    mouseInfluence: {
      ...defaultMouseInfluence,
      position: { x: 200, y: 200 },
      disruptionRadius: 150,
    },
    visible: true,
  },
  play: async context => {
    await testAllViewports(context);
  },
});
