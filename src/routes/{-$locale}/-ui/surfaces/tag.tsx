import type { Hue } from './card';
import type { FC, ReactNode } from 'react';

const HUES = {
  cyan: { color: 'var(--hue-cyan, #8fe9ff)', border: 'var(--hue-cyan-line, rgba(4,254,255,.5))' },
  mint: { color: 'var(--hue-mint, #6ff2cc)', border: 'var(--hue-mint-line, rgba(0,221,168,.5))' },
  sky: { color: 'var(--hue-sky, #7dd2ff)', border: 'var(--hue-sky-line, rgba(4,176,236,.55))' },
  violet: { color: 'var(--hue-violet, #e2a9ff)', border: 'var(--hue-violet-line, rgba(196,73,208,.6))' },
  rose: { color: 'var(--hue-rose, #ffb3cd)', border: 'var(--hue-rose-line, rgba(247,105,151,.55))' },
};

interface TagProps {
  hue?: Hue;
  children?: ReactNode;
}

export const Tag: FC<TagProps> = ({ hue = 'cyan', children }) => {
  const { color, border } = HUES[hue];
  return (
    <span
      style={{
        fontSize: 'var(--text-tag, 12px)',
        border: `1px solid ${border}`,
        color,
        borderRadius: 999,
        padding: '2px 10px',
        display: 'inline-flex',
        alignItems: 'center',
        fontFamily: "var(--font-sans, 'Noto Sans JP', sans-serif)",
      }}
    >
      {children}
    </span>
  );
};
