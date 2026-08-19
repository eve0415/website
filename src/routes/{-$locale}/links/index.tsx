import { createFileRoute, rootRouteId, useRouteContext } from '@tanstack/react-router';

import { Card } from '#components/card';
import { LinkRow } from '#components/link-row';
import { PageHeader } from '#components/page-header';
import { CONTACT_COPY } from '#i18n/copy';
import { localeHead } from '#i18n/head';

import { ContactForm } from './-/contact-form';
import { DiscordCopy } from './-/discord-copy';

const DISCORD_HANDLE = 'eve0415';

const Links = () => {
  const locale = useRouteContext({ from: rootRouteId, select: context => context.locale });
  const copy = CONTACT_COPY[locale];

  return (
    <div className='relative mx-auto grid max-w-(--page-max-narrow) gap-7 px-6 pt-12 pb-24'>
      <PageHeader kicker='CONTACT' title={copy.title} lede={copy.intro} className='animate-[fadeUp_0.6s_ease_backwards]' />

      <div className='grid gap-3'>
        <LinkRow
          href='https://github.com/eve0415'
          target='_blank'
          rel='noopener'
          label='GitHub'
          value='github.com/eve0415'
          className='animate-[fadeUp_0.6s_ease_0.08s_backwards]'
        />
        <LinkRow
          href='https://x.com/eveevekun'
          target='_blank'
          rel='noopener'
          label={copy.xLabel}
          value='@eveevekun'
          className='animate-[fadeUp_0.6s_ease_0.16s_backwards]'
        />
        <LinkRow
          label='Discord'
          value={DISCORD_HANDLE}
          className='animate-[fadeUp_0.6s_ease_0.24s_backwards]'
          action={<DiscordCopy handle={DISCORD_HANDLE} copyLabel={copy.discordCopy} copiedLabel={copy.discordCopied} toastLabel={copy.toastCopied} />}
        />
      </div>

      <Card className='grid animate-[fadeUp_0.6s_ease_0.32s_backwards] gap-4 p-[26px_24px]'>
        <div className='grid gap-1.5'>
          <h2 className='text-[1.125rem] font-bold text-(--ink-title)'>{copy.formHead}</h2>
          <p className='text-(length:--text-nav) leading-[1.8] text-(--ink-muted)'>{copy.formIntro}</p>
        </div>
        <ContactForm locale={locale} />
      </Card>

      <Card variant='soft' className='grid animate-[fadeUp_0.6s_ease_0.4s_backwards] gap-3 border-[rgba(0,221,168,0.35)] p-5.5'>
        <h2 className='text-[1.125rem] font-bold text-(--hue-mint)'>{copy.workHead}</h2>
        <p className='text-(length:--text-body) leading-[1.8] text-(--ink-muted)'>{copy.workBody}</p>
      </Card>
    </div>
  );
};

export const Route = createFileRoute('/{-$locale}/links/')({
  head: ({ match }) => localeHead(match.context.locale, '/links'),
  component: Links,
});
