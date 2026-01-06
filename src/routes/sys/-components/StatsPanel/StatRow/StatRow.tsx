import type { FC } from 'react';

import { useDecryptNumber } from '../useDecryptAnimation';

export interface StatRowProps {
  label: string;
  value: number;
  suffix?: string;
  delay: number;
  animate: boolean;
  color?: 'primary' | 'secondary' | 'tertiary';
}

const StatRow: FC<StatRowProps> = ({ label, value, suffix = '', delay, animate, color = 'primary' }) => {
  const displayValue = useDecryptNumber(value, {
    enabled: animate,
    delay,
    duration: 1200,
  });

  const colorClass = {
    primary: 'text-accent-primary',
    secondary: 'text-accent-secondary',
    tertiary: 'text-accent-tertiary',
  }[color];

  return (
    <div className='flex items-baseline justify-between border-border-subtle border-b py-2 last:border-b-0'>
      <span className='font-mono text-sm text-text-muted uppercase tracking-wider'>{label}</span>
      <span className={`font-mono text-lg ${colorClass}`}>
        {displayValue}
        {suffix && <span className='ml-1 text-text-muted text-xs'>{suffix}</span>}
      </span>
    </div>
  );
};

export default StatRow;
