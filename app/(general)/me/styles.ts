import { css } from 'styled-system/css';
import { grid } from 'styled-system/patterns';

export const title = css({ fontSize: '1.8rem', marginBottom: 4 });
export const gridClass = grid({
  columns: { smDown: 2, lg: 4, xl: 8 },
  gap: { smDown: 2, lg: 6 },
});
