import type { CSSProperties, FC } from 'react';

import './shooting-star.css';

type ShootingStarDirection = 'left' | 'right';

interface ShootingStarProps {
  direction?: ShootingStarDirection;
  tail?: number;
  duration?: number;
  delay?: number;
  style?: CSSProperties;
}

const HEAD_STYLE: CSSProperties = {
  width: 7,
  height: 7,
  borderRadius: '50%',
  background: 'var(--star-white, #fcf7fd)',
  boxShadow: 'var(--glow-star, 0 0 12px 3px rgba(4,254,255,.85))',
  flex: 'none',
};

export const ShootingStar: FC<ShootingStarProps> = ({ direction = 'left', tail = 160, duration = 12, delay = 4, style }) => {
  const head = <span style={HEAD_STYLE} />;
  const tailStyle: CSSProperties =
    direction === 'left'
      ? { width: tail, height: 2, marginLeft: -3, background: 'linear-gradient(90deg, #04feff, rgba(0,221,168,.6), transparent)', borderRadius: 2 }
      : { width: tail, height: 2, marginRight: -3, background: 'linear-gradient(90deg, transparent, rgba(0,221,168,.55), #04feff)', borderRadius: 2 };
  const trail = <span style={tailStyle} />;

  return (
    <div
      aria-hidden='true'
      style={{
        position: 'absolute',
        animation: `${direction === 'left' ? 'evShootL' : 'evShootR'} ${duration}s linear ${delay}s infinite backwards`,
        ...style,
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center' }}>
        {direction === 'left' ? (
          <>
            {head}
            {trail}
          </>
        ) : (
          <>
            {trail}
            {head}
          </>
        )}
      </span>
    </div>
  );
};
