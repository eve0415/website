import { expect, within } from 'storybook/test';

import preview from '#.storybook/preview';
import { chromaticModes } from '#.storybook/viewports';

import ProjectCard from './ProjectCard';
import { basicProject, featuredProject, featuredWithHighlight, minimalProject, projectWithHighlight } from './ProjectCard.fixtures';

const meta = preview.meta({
  component: ProjectCard,
  tags: ['autodocs'],
  parameters: { layout: 'centered', chromatic: { modes: chromaticModes } },
  argTypes: {
    index: { control: 'number' },
  },
  decorators: [
    Story => (
      <div className='max-w-2xl'>
        <Story />
      </div>
    ),
  ],
});

export const Default = meta.story({
  args: {
    project: basicProject,
    index: 0,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Sample Project')).toBeInTheDocument();
    await expect(canvas.getByText('TypeScript')).toBeInTheDocument();
    await expect(canvas.getByText('React')).toBeInTheDocument();
  },
});

export const Featured = meta.story({
  args: {
    project: featuredProject,
    index: 0,
  },
});

export const WithHighlight = meta.story({
  args: {
    project: projectWithHighlight,
    index: 0,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('10k+')).toBeInTheDocument();
    await expect(canvas.getByText('downloads')).toBeInTheDocument();
  },
});

export const FeaturedWithHighlight = meta.story({
  args: {
    project: featuredWithHighlight,
    index: 0,
  },
});

export const Minimal = meta.story({
  args: {
    project: minimalProject,
    index: 0,
  },
});

export const MultipleIndices = meta.story({
  render: () => (
    <div className='grid max-w-4xl gap-4 md:grid-cols-2'>
      <ProjectCard project={basicProject} index={0} />
      <ProjectCard project={projectWithHighlight} index={1} />
      <ProjectCard project={minimalProject} index={2} />
    </div>
  ),
});

export const FeaturedInGrid = meta.story({
  render: () => (
    <div className='grid max-w-4xl gap-4 md:grid-cols-2'>
      <ProjectCard project={featuredWithHighlight} index={0} />
      <ProjectCard project={basicProject} index={1} />
      <ProjectCard project={projectWithHighlight} index={2} />
    </div>
  ),
});
