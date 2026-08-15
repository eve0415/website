import type { FC, ReactNode } from 'react';

interface ChipProps {
  children?: ReactNode;
}

export const Chip: FC<ChipProps> = ({ children }) => (
  <span
    style={{
      fontSize: 'var(--text-small, 14px)',
      border: '1px solid var(--line-chip, rgba(210,205,255,.35))',
      color: '#e4dfff',
      borderRadius: 999,
      padding: '7px 15px',
      display: 'inline-flex',
      alignItems: 'center',
      fontFamily: "var(--font-sans, 'Noto Sans JP', sans-serif)",
    }}
  >
    {children}
  </span>
);
