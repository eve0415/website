import type { FC } from 'react';

interface PageHeaderProps {
  kicker?: string;
  title?: string;
  lede?: string;
}

export const PageHeader: FC<PageHeaderProps> = ({ kicker, title, lede }) => (
  <div style={{ display: 'grid', gap: 8, fontFamily: "var(--font-sans, 'Noto Sans JP', sans-serif)" }}>
    {kicker ? (
      <p style={{ margin: 0, fontSize: 'var(--text-caption, 13px)', letterSpacing: 'var(--tracking-kicker, .26em)', color: 'var(--ink-ice, #9fe8ff)' }}>
        {kicker}
      </p>
    ) : null}
    <h1 style={{ margin: 0, fontSize: 'var(--text-h1, clamp(30px, 5vw, 42px))', lineHeight: 1.2, fontWeight: 700, color: 'var(--ink-title, #fcf7fd)' }}>
      {title}
    </h1>
    {lede ? <p style={{ margin: 0, fontSize: 'var(--text-body, 15.5px)', lineHeight: 1.8, color: 'var(--ink-muted, #cfc9f2)' }}>{lede}</p> : null}
  </div>
);
