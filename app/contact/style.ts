import { css } from 'styled-system/css';
import { flex } from 'styled-system/patterns';

export const buttonStyle = flex({
  alignItems: 'center',
  height: '90px',
  width: { mdDown: '100%', md: '350px' },
  padding: 4,
  fontSize: '1.5rem',
  color: 'white',
  borderRadius: 'xl',
  transition: 'background-color 0.2s ease-in-out',
});

export const title = css({ fontSize: '1.8rem', marginBottom: 4 });
