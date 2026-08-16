import { createFileRoute, rootRouteId, useRouteContext } from '@tanstack/react-router';

import { CONTACT_COPY } from '#i18n/copy';
import { localeHead } from '#i18n/head';

import { PageHeader } from '../-/ui/content/page-header';
import { Card } from '../-/ui/surfaces/card';
import { LinkRow } from '../-/ui/surfaces/link-row';

import { ContactForm } from './-/contact-form';
import { DiscordCopy } from './-/discord-copy';

const DISCORD_HANDLE = 'eve0415';

const Links = () => {
  const locale = useRouteContext({ from: rootRouteId, select: context => context.locale });
  const copy = CONTACT_COPY[locale];

  return (
    <div className='relative mx-auto grid max-w-[720px] gap-[28px] px-[24px] pt-[48px] pb-[96px]'>
      <PageHeader kicker='CONTACT' title={copy.title} lede={copy.intro} className='animate-[fadeUp_0.6s_ease_backwards]' />

      <div className='grid gap-[12px]'>
        <LinkRow
          href='https://github.com/eve0415'
          target='_blank'
          rel='noopener'
          label='GitHub'
          value='github.com/eve0415'
          className='animate-[fadeUp_0.6s_ease_0.08s_backwards]'
        />
        <LinkRow href='https://x.com/eveevekun' target='_blank' rel='noopener' label={copy.xLabel} value='@eveevekun' className='ev-reveal' />
        <LinkRow
          label='Discord'
          value={DISCORD_HANDLE}
          className='ev-reveal'
          action={<DiscordCopy handle={DISCORD_HANDLE} copyLabel={copy.discordCopy} copiedLabel={copy.discordCopied} toastLabel={copy.toastCopied} />}
        />
      </div>

      <Card className='ev-reveal grid gap-[16px] p-[26px_24px]'>
        <div className='grid gap-[6px]'>
          <h2 className='text-[18px] font-bold text-(--ink-title)'>{copy.formHead}</h2>
          <p className='text-[14.5px] leading-[1.8] text-(--ink-muted)'>{copy.formIntro}</p>
        </div>
        <ContactForm locale={locale} />
      </Card>

      <Card variant='soft' className='ev-reveal grid gap-[12px] border-[rgba(0,221,168,0.35)] p-[22px]'>
        <h2 className='text-[18px] font-bold text-(--hue-mint)'>{copy.workHead}</h2>
        <p className='text-(length:--text-body) leading-[1.8] text-(--ink-muted)'>{copy.workBody}</p>
      </Card>
    </div>
  );
};

export const Route = createFileRoute('/{-$locale}/links/')({
  head: ({ match }) => localeHead(match.context.locale, '/links'),
  component: Links,
});
