import { css } from 'styled-system/css';
import { grid } from 'styled-system/patterns';

export const title = css({ fontSize: '1.8rem', marginBottom: 4 });
export const gridClass = grid({
  columns: { smDown: 2, mdToLg: 4, xlDown: 4, '2xlDown': 6, '2xl': 6 },
  gap: { base: 2, lg: 6 },
});
