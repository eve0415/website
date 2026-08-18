import type { CommandSegment } from './-/command-box';
import type { ProjectLink } from './-/links-section';

import { createFileRoute, rootRouteId, useRouteContext } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { OASTS_COPY, PROJECT_COPY } from '#i18n/copy';
import { localeHead } from '#i18n/head';

import { cn } from '../-/cn';
import { PageHeader } from '../-/ui/content/page-header';
import { Tag } from '../-/ui/surfaces/tag';

import { BackLink } from './-/back-link';
import { CommandBox } from './-/command-box';
import { LinksSection } from './-/links-section';
import { StatCard } from './-/stat-card';

const TAGS = ['Rust', 'TypeScript'] as const;

const LINKS = [
  { label: 'GitHub', value: 'github.com/eve0415/oasts ↗', href: 'https://github.com/eve0415/oasts' },
  { label: 'npm', value: '@oasts/cli ↗', href: 'https://www.npmjs.com/package/@oasts/cli' },
] as const satisfies ProjectLink[];

const PACKAGE_MANAGERS = ['pnpm', 'npm', 'bun', 'yarn'] as const;

type PackageManager = (typeof PACKAGE_MANAGERS)[number];

const TAB =
  'min-h-[42px] cursor-pointer rounded-t-[9px] border border-b-0 p-[10px_16px_11px] font-mono text-(length:--text-caption) transition-[color,background] duration-150 ease-[ease] hover:text-(--ink-ice) -mb-px';

const segmentsFor = (pm: PackageManager): readonly CommandSegment[] => [
  { key: 'pm', text: pm, color: 'text-(--accent-cyan)' },
  { key: 'verb', text: pm === 'npm' ? ' install' : ' add', color: 'text-(--ink-ice)' },
  { key: 'flag', text: ' -D', color: 'text-(--star-lilac)' },
  { key: 'pkg', text: ' @oasts/cli', color: 'text-(--ink-title)' },
];

/** Truncates the command to its first `count` characters, segment by segment. */
const cut = (segments: readonly CommandSegment[], count: number | null): readonly CommandSegment[] => {
  if (count === null) return segments;
  const shown: CommandSegment[] = [];
  let left = count;
  for (const segment of segments) {
    if (left <= 0) break;
    shown.push({ key: segment.key, text: segment.text.slice(0, left), color: segment.color });
    left -= segment.text.length;
  }
  return shown;
};

const prefersReducedMotion = () => globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches;

const Oasts = () => {
  const locale = useRouteContext({ from: rootRouteId, select: context => context.locale });
  const copy = OASTS_COPY[locale];
  const chrome = PROJECT_COPY[locale];

  const [pm, setPm] = useState<PackageManager>('pnpm');
  /**
   * How many characters of the command are typed out, or `null` for all of
   * them. Starts at `null` so the prerendered HTML carries the whole command,
   * and only a package-manager switch — a click, so always client-side — ever
   * retypes it.
   */
  const [typed, setTyped] = useState<number | null>(null);
  const [typeRun, setTypeRun] = useState(0);

  const segments = segmentsFor(pm);
  const command = segments.map(segment => segment.text).join('');

  useEffect(() => {
    if (typeRun === 0) return;
    const full = command.length;
    let count = 0;
    const id = setInterval(() => {
      count += 2;
      if (count >= full) {
        clearInterval(id);
        setTyped(null);
      } else {
        setTyped(count);
      }
    }, 26);
    return () => {
      clearInterval(id);
    };
  }, [typeRun, command.length]);

  const tabs = (
    <fieldset aria-label={copy.pmAria} className='flex flex-wrap gap-[3px]'>
      {PACKAGE_MANAGERS.map(key => (
        <button
          key={key}
          type='button'
          aria-pressed={key === pm}
          className={cn(TAB, key === pm ? 'border-[rgba(160,150,255,.32)] bg-[rgba(3,1,17,.92)] text-(--accent-cyan)' : 'border-transparent text-[#8d85c8]')}
          onClick={() => {
            if (key === pm) return;
            setPm(key);
            if (prefersReducedMotion()) {
              setTyped(null);
              return;
            }
            // The command retypes itself on a switch, but not on first paint —
            // the prerendered HTML carries the whole command already.
            setTyped(0);
            setTypeRun(run => run + 1);
          }}
        >
          {key}
        </button>
      ))}
    </fieldset>
  );

  return (
    <div className='relative mx-auto grid max-w-(--page-max-article) gap-[24px] px-[24px] pt-[48px] pb-[96px]'>
      <BackLink locale={locale} />

      <PageHeader
        kicker='PROJECT'
        title='oasts'
        lede={copy.lede}
        className='animate-[fadeUp_0.6s_ease_0.08s_backwards] gap-[10px]'
        tags={TAGS.map(tag => (
          <Tag key={tag} hue='sky' className='px-[12px] py-[3px]'>
            {tag}
          </Tag>
        ))}
      />

      <div className='ev-reveal grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-[14px]'>
        <StatCard hue='sky' value={copy.stat1} label={copy.stat1Label} />
        <StatCard hue='sky' value={copy.stat2} label={copy.stat2Label} />
        <StatCard hue='sky' value='0' label={copy.stat3Label} />
      </div>

      <CommandBox
        tabs={tabs}
        segments={cut(segments, typed)}
        command={command}
        copiedText={chrome.copied}
        copyLabel={chrome.btnCopy}
        copiedLabel={chrome.btnCopied}
        caretClassName='text-(--accent-cyan)'
      />

      <LinksSection ink='sky' heading={chrome.linksHead} links={LINKS} />
    </div>
  );
};

export const Route = createFileRoute('/{-$locale}/projects/oasts')({
  head: ({ match }) => localeHead(match.context.locale, '/projects/oasts'),
  component: Oasts,
});
