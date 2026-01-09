import { expect, fn, userEvent, within } from 'storybook/test';

import preview from '#.storybook/preview';
import { testAllViewports } from '#.storybook/viewports';

import { DebugToolbar } from './debug-toolbar';

const meta = preview.meta({
  component: DebugToolbar,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    isPaused: { control: 'boolean' },
    currentIndex: { control: 'number' },
    totalMessages: { control: 'number' },
  },
  decorators: [
    Story => (
      <div className='min-h-24 bg-background p-8'>
        <Story />
      </div>
    ),
  ],
});

// --- State Stories ---

export const Paused = meta.story({
  args: {
    isPaused: true,
    currentIndex: 5,
    totalMessages: 42,
    onContinue: fn(),
    onPause: fn(),
    onStepOver: fn(),
    onStepInto: fn(),
    onStepOut: fn(),
    onStepBack: fn(),
    onStop: fn(),
  },
  play: async context => {
    const canvas = within(context.canvasElement);

    // Verify paused state indicator
    await expect(canvas.getByText('DEBUG')).toBeInTheDocument();
    await expect(canvas.getByText('6')).toBeInTheDocument(); // 1-based index
    await expect(canvas.getByText('42')).toBeInTheDocument();

    // Continue button should be visible when paused
    await expect(canvas.getByRole('button', { name: /Continue/i })).toBeInTheDocument();

    await testAllViewports(context);
  },
});

export const Running = meta.story({
  args: {
    isPaused: false,
    currentIndex: 10,
    totalMessages: 42,
    onContinue: fn(),
    onPause: fn(),
    onStepOver: fn(),
    onStepInto: fn(),
    onStepOut: fn(),
    onStepBack: fn(),
    onStop: fn(),
  },
  play: async context => {
    const canvas = within(context.canvasElement);

    // Pause button should be visible when running
    await expect(canvas.getByRole('button', { name: /Pause/i })).toBeInTheDocument();

    // Step buttons should be disabled when not paused
    const stepOverBtn = canvas.getByRole('button', { name: /Step Over/i });
    const stepIntoBtn = canvas.getByRole('button', { name: /Step Into/i });
    const stepOutBtn = canvas.getByRole('button', { name: /Step Out/i });
    const stepBackBtn = canvas.getByRole('button', { name: /Step Back/i });

    await expect(stepOverBtn).toBeDisabled();
    await expect(stepIntoBtn).toBeDisabled();
    await expect(stepOutBtn).toBeDisabled();
    await expect(stepBackBtn).toBeDisabled();

    await testAllViewports(context);
  },
});

export const AtStart = meta.story({
  args: {
    isPaused: true,
    currentIndex: 0,
    totalMessages: 42,
    onContinue: fn(),
    onPause: fn(),
    onStepOver: fn(),
    onStepInto: fn(),
    onStepOut: fn(),
    onStepBack: fn(),
    onStop: fn(),
  },
  play: async context => {
    const canvas = within(context.canvasElement);

    // Index display should show 1/42 (1-based)
    await expect(canvas.getByText('1')).toBeInTheDocument();
    await expect(canvas.getByText('42')).toBeInTheDocument();

    // Step Back should be disabled at index 0
    const stepBackBtn = canvas.getByRole('button', { name: /Step Back/i });
    await expect(stepBackBtn).toBeDisabled();

    // Other step buttons should be enabled
    await expect(canvas.getByRole('button', { name: /Step Over/i })).toBeEnabled();
    await expect(canvas.getByRole('button', { name: /Step Into/i })).toBeEnabled();
    await expect(canvas.getByRole('button', { name: /Step Out/i })).toBeEnabled();
  },
});

export const AtEnd = meta.story({
  args: {
    isPaused: true,
    currentIndex: 41, // 0-indexed, so 41 is the last of 42
    totalMessages: 42,
    onContinue: fn(),
    onPause: fn(),
    onStepOver: fn(),
    onStepInto: fn(),
    onStepOut: fn(),
    onStepBack: fn(),
    onStop: fn(),
  },
  play: async context => {
    const canvas = within(context.canvasElement);

    // Index display should show 42/42 (1-based) - both elements show 42
    const allText42 = canvas.getAllByText('42');
    await expect(allText42.length).toBe(2); // currentIndex and totalMessages

    // Step Back should be enabled at end
    const stepBackBtn = canvas.getByRole('button', { name: /Step Back/i });
    await expect(stepBackBtn).toBeEnabled();
  },
});

export const MidProgress = meta.story({
  args: {
    isPaused: true,
    currentIndex: 20,
    totalMessages: 42,
    onContinue: fn(),
    onPause: fn(),
    onStepOver: fn(),
    onStepInto: fn(),
    onStepOut: fn(),
    onStepBack: fn(),
    onStop: fn(),
  },
  play: async context => {
    const canvas = within(context.canvasElement);

    // Index display should show 21/42 (1-based)
    await expect(canvas.getByText('21')).toBeInTheDocument();
    await expect(canvas.getByText('42')).toBeInTheDocument();

    // All step buttons should be enabled
    await expect(canvas.getByRole('button', { name: /Step Over/i })).toBeEnabled();
    await expect(canvas.getByRole('button', { name: /Step Into/i })).toBeEnabled();
    await expect(canvas.getByRole('button', { name: /Step Out/i })).toBeEnabled();
    await expect(canvas.getByRole('button', { name: /Step Back/i })).toBeEnabled();
  },
});

// --- Interaction Stories ---

export const ContinueButton = meta.story({
  args: {
    isPaused: true,
    currentIndex: 5,
    totalMessages: 42,
    onContinue: fn(),
    onPause: fn(),
    onStepOver: fn(),
    onStepInto: fn(),
    onStepOut: fn(),
    onStepBack: fn(),
    onStop: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    const continueBtn = canvas.getByRole('button', { name: /Continue/i });
    await userEvent.click(continueBtn);

    await expect(args.onContinue).toHaveBeenCalledOnce();
  },
});

export const PauseButton = meta.story({
  args: {
    isPaused: false,
    currentIndex: 5,
    totalMessages: 42,
    onContinue: fn(),
    onPause: fn(),
    onStepOver: fn(),
    onStepInto: fn(),
    onStepOut: fn(),
    onStepBack: fn(),
    onStop: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    const pauseBtn = canvas.getByRole('button', { name: /Pause/i });
    await userEvent.click(pauseBtn);

    await expect(args.onPause).toHaveBeenCalledOnce();
  },
});

export const StepButtons = meta.story({
  args: {
    isPaused: true,
    currentIndex: 5,
    totalMessages: 42,
    onContinue: fn(),
    onPause: fn(),
    onStepOver: fn(),
    onStepInto: fn(),
    onStepOut: fn(),
    onStepBack: fn(),
    onStop: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    // Test Step Over
    await userEvent.click(canvas.getByRole('button', { name: /Step Over/i }));
    await expect(args.onStepOver).toHaveBeenCalledOnce();

    // Test Step Into
    await userEvent.click(canvas.getByRole('button', { name: /Step Into/i }));
    await expect(args.onStepInto).toHaveBeenCalledOnce();

    // Test Step Out
    await userEvent.click(canvas.getByRole('button', { name: /Step Out/i }));
    await expect(args.onStepOut).toHaveBeenCalledOnce();

    // Test Step Back
    await userEvent.click(canvas.getByRole('button', { name: /Step Back/i }));
    await expect(args.onStepBack).toHaveBeenCalledOnce();

    // Test Stop
    await userEvent.click(canvas.getByRole('button', { name: /Stop/i }));
    await expect(args.onStop).toHaveBeenCalledOnce();
  },
});

export const RapidClicking = meta.story({
  args: {
    isPaused: true,
    currentIndex: 0,
    totalMessages: 42,
    onContinue: fn(),
    onPause: fn(),
    onStepOver: fn(),
    onStepInto: fn(),
    onStepOut: fn(),
    onStepBack: fn(),
    onStop: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    const stepIntoBtn = canvas.getByRole('button', { name: /Step Into/i });

    // Click Step Into 10 times rapidly
    for (let i = 0; i < 10; i++) {
      await userEvent.click(stepIntoBtn);
    }

    // Verify callback was called 10 times
    await expect(args.onStepInto).toHaveBeenCalledTimes(10);
  },
});

export const ButtonDisabledStates = meta.story({
  args: {
    isPaused: true,
    currentIndex: 0,
    totalMessages: 42,
    onContinue: fn(),
    onPause: fn(),
    onStepOver: fn(),
    onStepInto: fn(),
    onStepOut: fn(),
    onStepBack: fn(),
    onStop: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    // Step Back should be disabled at index 0
    const stepBackBtn = canvas.getByRole('button', { name: /Step Back/i });
    await expect(stepBackBtn).toBeDisabled();

    // Clicking disabled button should not trigger callback
    await userEvent.click(stepBackBtn);
    await expect(args.onStepBack).not.toHaveBeenCalled();
  },
});
