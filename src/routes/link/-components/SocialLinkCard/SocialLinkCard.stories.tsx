import { expect, within } from 'storybook/test';

import preview from '#.storybook/preview';
import { testAllViewports } from '#.storybook/viewports';

import SocialLinkCard from './SocialLinkCard';
import { discordLink, githubLink, placeholderLink, twitterLink } from './SocialLinkCard.fixtures';

const meta = preview.meta({
  component: SocialLinkCard,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    index: { control: 'number' },
  },
  decorators: [
    Story => (
      <div className='w-80'>
        <Story />
      </div>
    ),
  ],
});

export const GitHub = meta.story({
  args: {
    link: githubLink,
    index: 0,
  },
  play: async context => {
    await testAllViewports(context);

    const canvas = within(context.canvasElement);
    await expect(canvas.getByText('GitHub')).toBeInTheDocument();
    await expect(canvas.getByText('@eve0415')).toBeInTheDocument();
    const link = canvas.getByRole('link');
    await expect(link).toHaveAttribute('href', 'https://github.com/eve0415');
  },
});

export const Twitter = meta.story({
  args: {
    link: twitterLink,
    index: 0,
  },
});

export const Discord = meta.story({
  args: {
    link: discordLink,
    index: 0,
  },
});

export const Placeholder = meta.story({
  args: {
    link: placeholderLink,
    index: 0,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link');
    await expect(link).toHaveAttribute('href', '#');
    await expect(link).not.toHaveAttribute('target');
  },
});

export const MultipleIndices = meta.story({
  render: () => (
    <div className='flex w-80 flex-col gap-3'>
      <SocialLinkCard link={githubLink} index={0} />
      <SocialLinkCard link={twitterLink} index={1} />
      <SocialLinkCard link={discordLink} index={2} />
    </div>
  ),
});

export const AllLinks = meta.story({
  render: () => (
    <div className='flex w-80 flex-col gap-3'>
      <SocialLinkCard link={githubLink} index={0} />
      <SocialLinkCard link={twitterLink} index={1} />
      <SocialLinkCard link={discordLink} index={2} />
      <SocialLinkCard link={placeholderLink} index={3} />
    </div>
  ),
});
