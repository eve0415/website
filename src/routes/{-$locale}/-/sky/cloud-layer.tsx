import type { Puff } from './puffs';
import type { FC } from 'react';

import { fluid } from './puffs';

interface CloudLayerProps {
  puffs: readonly Puff[];
  /** One of the three cloud tones in `sky-scene`. */
  background: string;
  /** Softness in px at the design width — the further back the layer, the blurrier. */
  blur: number;
}

/* Softness rides the same curve the puffs do. Held at its authored px while the
   puffs shrink, an edge tuned against a 300px cloud is most of a 90px one, and
   the sea turns to haze on exactly the screens the shrinking was for. */
export const CloudLayer: FC<CloudLayerProps> = ({ puffs, background, blur }) => (
  <>
    {puffs.map(puff => (
      <span
        key={puff.key}
        className='absolute rounded-[50%]'
        style={{ left: puff.left, bottom: puff.bottom, width: puff.width, height: puff.height, background, filter: `blur(${fluid(blur)})` }}
      />
    ))}
  </>
);
