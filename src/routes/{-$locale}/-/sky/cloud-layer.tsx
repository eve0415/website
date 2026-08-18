import type { Puff } from './puffs';
import type { FC } from 'react';

interface CloudLayerProps {
  puffs: readonly Puff[];
  /** One of the three cloud tones in `sky-scene`. */
  background: string;
  /** Softness in px — the further back the layer, the blurrier. */
  blur: number;
}

export const CloudLayer: FC<CloudLayerProps> = ({ puffs, background, blur }) => (
  <>
    {puffs.map(puff => (
      <span
        key={puff.key}
        className='absolute rounded-[50%]'
        style={{ left: puff.left, bottom: puff.bottom, width: puff.width, height: puff.height, background, filter: `blur(${blur}px)` }}
      />
    ))}
  </>
);
