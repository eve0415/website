import type { HeadingInk } from '#components/card';
import type { FC, ReactNode } from 'react';

import { Card, HEADING_INK } from '#components/card';
import { cn } from '#lib/cn';

interface PanelHeadingProps {
  ink: HeadingInk;
  children?: ReactNode;
}

export const PanelHeading: FC<PanelHeadingProps> = ({ ink, children }) => <h2 className={cn('text-[1rem] font-bold', HEADING_INK[ink])}>{children}</h2>;

interface NotePanelProps {
  ink: HeadingInk;
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
