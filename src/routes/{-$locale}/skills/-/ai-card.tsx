import type { Locale } from '#i18n/locale';
import type { SkillItem } from './skill-chips';
import type { FC } from 'react';

import { Link } from '@tanstack/react-router';

import { Card } from '#components/card';
import { SKILLS_COPY } from '#i18n/copy';

import { localeParams } from '../../-/routed-links';

import { SkillChips } from './skill-chips';

/**
 * The one card that spans the grid: it says how the rest of the page gets
 * built, so it reads before the tools it is built with.
 */
export const AiCard: FC<{ locale: Locale }> = ({ locale }) => {
  const copy = SKILLS_COPY[locale];

  const agents: SkillItem[] = [
    { label: 'Claude Code', href: 'https://claude.com/product/claude-code', daily: true },
    { label: 'Claude Design', href: 'https://claude.com/product/design' },
    { label: 'Codex', href: 'https://openai.com/codex/' },
    { label: 'Gemini CLI', href: 'https://github.com/google-gemini/gemini-cli' },
    { label: 'GitHub Copilot', href: 'https://github.com/features/copilot' },
    { label: 'ChatGPT', href: 'https://chatgpt.com/' },
    { label: copy.chipMcp, href: 'https://modelcontextprotocol.io/' },
  ];

  return (
    <Card className='col-span-full grid animate-[fadeUp_0.6s_ease_0.08s_backwards] content-start gap-3.5 border-(--line-accent-dashed) p-(--pad-card-lg)'>
      <h2 className='text-(length:--text-panel-title) font-bold text-(--accent-cyan)'>{copy.aiHead}</h2>
      <p className='text-(length:--text-body) leading-[1.8] text-(--ink-muted)'>
        {copy.aiBefore}
        {/* Same trade the about page's inline link makes: colour alone is
            1.16:1 against the surrounding prose, so it carries an underline. */}
        <Link to='/{-$locale}/projects/cella' params={localeParams(locale)} className='text-(--ink-ice) underline underline-offset-[3px]'>
          cella
        </Link>
        {copy.aiAfter}
      </p>
      <SkillChips items={agents} dailyLabel={copy.dailyLabel} />
    </Card>
  );
};
