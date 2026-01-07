import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';

// Test route exports exist
describe('Route exports', () => {
  test('index route exports Route', async () => {
    const indexModule = await import('./index');
    expect(indexModule.Route).toBeDefined();
  });

  test('link route exports Route', async () => {
    const linkModule = await import('./link/index');
    expect(linkModule.Route).toBeDefined();
  });

  test('projects route exports Route', async () => {
    const projectsModule = await import('./projects/index');
    expect(projectsModule.Route).toBeDefined();
  });

  test('skills route exports Route', async () => {
    const skillsModule = await import('./skills/index');
    expect(skillsModule.Route).toBeDefined();
  });

  // Note: sys route can't be dynamically imported in browser environment because it depends on
  // cloudflare:workers which doesn't exist outside the Cloudflare Workers runtime.
  // The sys route components (StatsPanel, LanguageStack, CodeRadar) are tested separately below.
});

// Test components that can be rendered in isolation
describe('Route components smoke tests', () => {
  test('link page components render', async () => {
    const SocialLinkCard = (await import('./link/-components/SocialLinkCard/SocialLinkCard')).default;
    const { twitterLink } = await import('./link/-components/SocialLinkCard/SocialLinkCard.fixtures');

    await render(<SocialLinkCard link={twitterLink} index={0} />);

    // Should render without crashing
    await expect.element(page.getByText('Twitter')).toBeInTheDocument();
  });

  test('projects page components render', async () => {
    const ProjectCard = (await import('./projects/-components/ProjectCard/ProjectCard')).default;
    const { basicProject } = await import('./projects/-components/ProjectCard/ProjectCard.fixtures');

    await render(<ProjectCard project={basicProject} index={0} />);

    // Should render project card - use getByRole to avoid matching both heading and description
    await expect.element(page.getByRole('heading', { name: 'Sample Project' })).toBeInTheDocument();
  });

  test('skills page components render', async () => {
    const SkillCard = (await import('./skills/-components/SkillCard/SkillCard')).default;
    const { expertSkill } = await import('./skills/-components/SkillCard/SkillCard.fixtures');

    await render(<SkillCard skill={expertSkill} index={0} />);

    await expect.element(page.getByText('TypeScript')).toBeInTheDocument();
  });

  test('sys page StatsPanel renders', async () => {
    const StatsPanel = (await import('./sys/-components/StatsPanel/StatsPanel')).default;
    const { sampleStats } = await import('./sys/-components/StatsPanel/StatsPanel.fixtures');

    await render(<StatsPanel stats={sampleStats} animate={false} />);

    // Should render stats panel section headers
    await expect.element(page.getByText('REPO_STATUS')).toBeInTheDocument();
  });

  test('sys page LanguageStack renders', async () => {
    const LanguageStack = (await import('./sys/-components/LanguageStack/LanguageStack')).default;
    const { sampleLanguages } = await import('./sys/-components/LanguageStack/LanguageStack.fixtures');

    await render(<LanguageStack languages={sampleLanguages} animate={false} />);

    // Should render language stack section header
    await expect.element(page.getByText('STACK_ANALYSIS')).toBeInTheDocument();
  });
});

// Verify index route can be imported (component uses hooks that need Router)
describe('Index route component validation', () => {
  test('index route module imports successfully', async () => {
    // Just verify the module can be imported
    const module = await import('./index');

    expect(module.Route).toBeDefined();
    expect(module.Route.options.component).toBeDefined();
  });

  test('index components can be imported', async () => {
    const Logo = await import('./-index/Logo');
    const TerminalText = await import('./-index/TerminalText');
    const Background = await import('./-index/Background/Background');

    expect(Logo.default).toBeDefined();
    expect(TerminalText.default).toBeDefined();
    expect(Background.default).toBeDefined();
  });

  test('Logo renders in isolation', async () => {
    const Logo = (await import('./-index/Logo')).default;

    await render(<Logo animate={false} />);

    const svg = page.getByRole('img');
    await expect.element(svg).toBeInTheDocument();
  });
});
