import { createFileRoute, rootRouteId, useRouteContext } from '@tanstack/react-router';

import { HOME_COPY, WORKS_COPY } from '#i18n/copy';
import { localeHead } from '#i18n/head';

import '../-projects/reveal.css';
import { ProjectCardLink } from '../-site/links';
import { SweepButton } from '../-ui/actions/sweep-button';
import { PageHeader } from '../-ui/content/page-header';

const Works = () => {
  const locale = useRouteContext({ from: rootRouteId, select: context => context.locale });
  const copy = WORKS_COPY[locale];
  // The one string this page shares with the home page's cella card.
  const { alphaNow } = HOME_COPY[locale];
  const params = { locale: locale === 'en' ? 'en' : undefined };

  return (
    <div className='relative mx-auto grid max-w-[1060px] gap-[28px] px-[24px] pt-[48px] pb-[96px]'>
      <PageHeader kicker='WORKS' title={copy.title} lede={copy.intro} className='animate-[fadeUp_0.6s_ease_backwards]' />

      <div className='grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-[18px]'>
        <ProjectCardLink
          to='/{-$locale}/projects/ifpatcher'
          params={params}
          featured
          name='IFPatcher'
          tag='Java'
          hue='cyan'
          description={copy.ifDesc}
          cta={copy.details}
          stat='930,000+'
          statLabel={copy.dlTotal}
          className='col-span-full animate-[fadeUp_0.6s_ease_0.08s_backwards]'
        />
        <ProjectCardLink
          to='/{-$locale}/projects/cella'
          params={params}
          name='cella'
          tag='Rust'
          hue='mint'
          description={copy.cellaDesc}
          stat={alphaNow}
          cta={copy.details}
          className='ev-reveal'
        />
        <ProjectCardLink
          to='/{-$locale}/projects/oasts'
          params={params}
          name='oasts'
          tag='TypeScript'
          hue='sky'
          description={copy.oastsDesc}
          cta={copy.details}
          className='ev-reveal'
        />
        <ProjectCardLink
          to='/{-$locale}/projects/dotclaude'
          params={params}
          name='dotclaude'
          tag='TypeScript'
          hue='violet'
          description={copy.dcDesc}
          cta={copy.details}
          className='ev-reveal'
        />
        <ProjectCardLink
          to='/{-$locale}/projects/website'
          params={params}
          name='eve0415.net'
          tag='Web'
          hue='rose'
          description={copy.siteDesc}
          cta={copy.seeHistory}
          className='ev-reveal'
        />
      </div>

      <SweepButton href='https://github.com/eve0415' target='_blank' rel='noopener' className='ev-reveal justify-self-start'>
        {copy.ghAll}
      </SweepButton>
    </div>
  );
};

export const Route = createFileRoute('/{-$locale}/projects/')({
  head: ({ match }) => localeHead(match.context.locale, '/projects'),
  component: Works,
});
