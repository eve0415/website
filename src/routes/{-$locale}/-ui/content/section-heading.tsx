import type { FC, ReactNode } from 'react';

interface SectionHeadingProps {
  children?: ReactNode;
}

export const SectionHeading: FC<SectionHeadingProps> = ({ children }) => (
  <h2
    style={{
      margin: 0,
      fontSize: 'var(--text-h2, clamp(24px, 3vw, 28px))',
      fontWeight: 700,
      color: 'var(--ink-title, #fcf7fd)',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      fontFamily: "var(--font-sans, 'Noto Sans JP', sans-serif)",
    }}
  >
    {children}
    <span aria-hidden='true' style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(4,254,255,.45), transparent)' }} />
  </h2>
);
