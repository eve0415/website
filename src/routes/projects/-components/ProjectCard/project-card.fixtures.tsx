import type { Project } from './project-card';

export const basicProject: Project = {
  title: 'Sample Project',
  description: 'A sample project for demonstrating the card component.',
  tags: ['TypeScript', 'React'],
  links: [{ label: 'GitHub', url: 'https://github.com/example' }],
};

export const featuredProject: Project = {
  title: 'Featured Project',
  description: 'This is a featured project that takes up more space and showcases important work.',
  tags: ['TypeScript', 'Node.js', 'Docker'],
  links: [
    { label: 'GitHub', url: 'https://github.com/example' },
    { label: 'Demo', url: 'https://example.com' },
  ],
  featured: true,
};

export const projectWithHighlight: Project = {
  title: 'Popular Project',
  description: 'A project with highlight metrics.',
  tags: ['Rust', 'CLI'],
  links: [{ label: 'GitHub', url: 'https://github.com/example' }],
  highlight: '10k+',
  highlightSub: 'downloads',
};

export const featuredWithHighlight: Project = {
  title: 'IFPatcher',
  description: 'A popular Minecraft mod with extensive downloads.',
  tags: ['Java', 'Minecraft', 'Gradle'],
  links: [
    { label: 'GitHub', url: 'https://github.com/eve0415/IFPatcher' },
    { label: 'CurseForge', url: 'https://curseforge.com' },
  ],
  featured: true,
  highlight: '795k+',
  highlightSub: 'downloads',
};

export const minimalProject: Project = {
  title: 'Minimal',
  description: 'Just the basics.',
  tags: ['Shell'],
  links: [{ label: 'View', url: '#' }],
};
