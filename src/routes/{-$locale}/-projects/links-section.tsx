import type { PanelInk } from './panel';
import type { FC } from 'react';

import { LinkRow } from '../-ui/surfaces/link-row';

import { PanelHeading } from './panel';

export interface ProjectLink {
  label: string;
  /** The trailing ↗ belongs to the string, as the design writes it. */
  value: string;
  href: string;
}

interface LinksSectionProps {
  ink: PanelInk;
  heading: string;
  links: readonly ProjectLink[];
}

export const LinksSection: FC<LinksSectionProps> = ({ ink, heading, links }) => (
  <section className='ev-reveal grid gap-[12px]'>
    <PanelHeading ink={ink}>{heading}</PanelHeading>
    {links.map(link => (
      <LinkRow key={link.href} href={link.href} target='_blank' rel='noopener' label={link.label} value={link.value} className='flex-wrap py-[15px]' />
    ))}
  </section>
);
