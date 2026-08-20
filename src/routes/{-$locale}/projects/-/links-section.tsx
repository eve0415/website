import type { HeadingInk } from '#components/card';
import type { FC } from 'react';

import { LinkRow } from '#components/link-row';

import { PanelHeading } from './panel';

export interface ProjectLink {
  label: string;
  /** The trailing ↗ belongs to the string, as the design writes it. */
  value: string;
  href: string;
}

interface LinksSectionProps {
  ink: HeadingInk;
  heading: string;
  links: readonly ProjectLink[];
}

export const LinksSection: FC<LinksSectionProps> = ({ ink, heading, links }) => (
  <section className='ev-reveal grid gap-3'>
    <PanelHeading ink={ink}>{heading}</PanelHeading>
    {links.map(link => (
      <LinkRow key={link.href} href={link.href} target='_blank' rel='noopener' label={link.label} value={link.value} className='flex-wrap py-[15px]' />
    ))}
  </section>
);
