import type { FC, ReactNode } from 'react';

interface SiteFooterProps {
  /** Trailing note, right-aligned; pass an empty string to drop it. */
  note?: string;
  children?: ReactNode;
}

export const SiteFooter: FC<SiteFooterProps> = ({ note = 'View Transitions / Scroll-driven Animations / Popover API 使用', children }) => (
  <footer
    style={{
      position: 'relative',
      background: 'radial-gradient(120% 220% at 50% 135%, var(--ev-footer-glow, rgba(142,70,217,.16)), transparent 60%)',
      borderTop: '1px solid var(--line-header, rgba(160,150,255,.18))',
      padding: '20px clamp(20px, 4vw, 40px) 26px',
      display: 'flex',
      gap: 18,
      flexWrap: 'wrap',
      alignItems: 'center',
      fontSize: 'var(--text-small, 14px)',
      color: 'var(--ink-faint, #a49dd8)',
      fontFamily: "var(--font-sans, 'Noto Sans JP', sans-serif)",
    }}
  >
    <span>© eve0415</span>
    {children}
    {note ? <span style={{ marginLeft: 'auto', fontSize: 13 }}>{note}</span> : null}
  </footer>
);
