import type { FC, ReactNode } from 'react';

import { cn } from '../-ui/cn';
import { Card } from '../-ui/surfaces/card';

/**
 * Panel headings do not track the project's card hue — IFPatcher's cards are
 * cyan but its headings are ice — so this is its own scale.
 */
export type PanelInk = 'ice' | 'mint' | 'sky' | 'violet' | 'rose';

const INK = {
  ice: 'text-(--ink-ice)',
  mint: 'text-(--hue-mint)',
  sky: 'text-(--hue-sky)',
  violet: 'text-(--hue-violet)',
  rose: 'text-(--hue-rose)',
};

interface PanelHeadingProps {
  ink: PanelInk;
  children?: ReactNode;
}

export const PanelHeading: FC<PanelHeadingProps> = ({ ink, children }) => <h2 className={cn('text-[16px] font-bold', INK[ink])}>{children}</h2>;

interface NotePanelProps {
  ink: PanelInk;
  head: string;
  body: string;
  /** The dashed treatment the design reserves for the privacy note. */
  dashed?: boolean;
}

export const NotePanel: FC<NotePanelProps> = ({ ink, head, body, dashed = false }) => (
  <Card variant={dashed ? 'dashed' : 'solid'} className={cn('ev-reveal grid', dashed ? 'gap-[10px] p-[20px_22px]' : 'gap-[12px] p-[22px]')}>
    <PanelHeading ink={ink}>{head}</PanelHeading>
    <p className={cn('text-(length:--text-body) text-(--ink-muted)', dashed ? 'leading-[1.8]' : 'leading-[1.9]')}>{body}</p>
  </Card>
);
