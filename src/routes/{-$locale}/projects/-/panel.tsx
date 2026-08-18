import type { FC, ReactNode } from 'react';

import { Card } from '#components/card';
import { cn } from '#lib/cn';
import { tw } from '#lib/tw';

/**
 * Panel headings do not track the project's card hue — IFPatcher's cards are
 * cyan but its headings are ice — so this is its own scale.
 */
export type PanelInk = 'ice' | 'mint' | 'sky' | 'violet' | 'rose';

const INK = {
  ice: tw('text-(--ink-ice)'),
  mint: tw('text-(--hue-mint)'),
  sky: tw('text-(--hue-sky)'),
  violet: tw('text-(--hue-violet)'),
  rose: tw('text-(--hue-rose)'),
} satisfies Record<PanelInk, string>;

interface PanelHeadingProps {
  ink: PanelInk;
  children?: ReactNode;
}

export const PanelHeading: FC<PanelHeadingProps> = ({ ink, children }) => <h2 className={cn('text-[1rem] font-bold', INK[ink])}>{children}</h2>;

interface NotePanelProps {
  ink: PanelInk;
  head: string;
  body: string;
  /** The dashed treatment the design reserves for the privacy note. */
  dashed?: boolean;
}

export const NotePanel: FC<NotePanelProps> = ({ ink, head, body, dashed = false }) => (
  <Card variant={dashed ? 'dashed' : 'solid'} className={cn('ev-reveal grid', dashed ? 'gap-2.5 p-[20px_22px]' : 'gap-3 p-5.5')}>
    <PanelHeading ink={ink}>{head}</PanelHeading>
    <p className={cn('text-(length:--text-body) text-(--ink-muted)', dashed ? 'leading-[1.8]' : 'leading-[1.9]')}>{body}</p>
  </Card>
);
