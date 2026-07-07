import { expect, userEvent, waitFor, within } from 'storybook/test';

import preview from '#.storybook/preview';
import { testAllViewports } from '#.storybook/viewports';

import { Route } from './index';

/**
 * Waits for the logo reveal to finish. Logo's stroke-draw animation hides the
 * paths (transparent fill) until an internal 2s timer fires, independent of
 * reduced motion, so screenshots must wait for the settled state.
 */
const waitForLogoSettled = async (canvasElement: HTMLElement): Promise<void> => {
  await waitFor(
    () => {
      const path = canvasElement.querySelector('path');
      void expect(path?.style.fill.toLowerCase()).toBe('currentcolor');
    },
    { timeout: 5000 },
  );
};

const meta = preview.meta({
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    tanstack: { router: { route: Route } },
  },
  decorators: [
    Story => (
      <div className='bg-background min-h-dvh'>
        <Story />
      </div>
    ),
  ],
});

/**
 * The real homepage route. Reduced motion (forced in the test environment)
 * reveals the tagline and nav immediately; in interactive Storybook the
 * staggered animations play, so assertions wait for the reveal.
 */
export const Default = meta.story({
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify main content
    await expect(await canvas.findByText('eve0415')).toBeInTheDocument();
    await expect(await canvas.findByText('エンジニア', undefined, { timeout: 5000 })).toBeInTheDocument();

    // Verify navigation (revealed after the tagline)
    await expect(await canvas.findByText('[Projects]', undefined, { timeout: 5000 })).toBeInTheDocument();
    await expect(canvas.getByText('[Skills]')).toBeInTheDocument();
    await expect(canvas.getByText('[Link]')).toBeInTheDocument();
    await expect(canvas.getByText('[Sys]')).toBeInTheDocument();

    // Verify keyboard hint
    await expect(canvas.getByText('でジャンプ')).toBeInTheDocument();

    // Verify footer
    await expect(canvas.getByText('35.6762°N, 139.6503°E')).toBeInTheDocument();
    await expect(canvas.getByText('4.0.0')).toBeInTheDocument();
  },
});

/**
 * Visual regression across viewports, taken after the logo reveal settles
 */
export const Static = meta.story({
  play: async context => {
    const canvas = within(context.canvasElement);
    await expect(await canvas.findByText('eve0415')).toBeInTheDocument();

    await waitForLogoSettled(context.canvasElement);
    await testAllViewports(context);
  },
});

/**
 * Konami code Easter egg, triggered through the real keyboard listener
 */
export const KonamiActivated = meta.story({
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText('eve0415')).toBeInTheDocument();

    await userEvent.keyboard('{ArrowUp}{ArrowUp}{ArrowDown}{ArrowDown}{ArrowLeft}{ArrowRight}{ArrowLeft}{ArrowRight}[KeyB][KeyA]');

    // Overlay stays up for 3s after activation - assert right away
    await expect(canvas.getByText('SECRET_UNLOCKED')).toBeInTheDocument();
    await expect(canvas.getByText('// 何かを見つけた...')).toBeInTheDocument();
  },
});

/**
 * Mobile layout showing responsive design
 */
export const MobileLayout = meta.story({
  play: async context => {
    const { setViewport } = await import('#.storybook/viewports');
    await setViewport('mobile');

    const canvas = within(context.canvasElement);

    // Content should still be visible on mobile
    await expect(await canvas.findByText('eve0415')).toBeInTheDocument();
    await expect(await canvas.findByText('[Projects]', undefined, { timeout: 5000 })).toBeInTheDocument();
  },
});
