import { styled } from '@mui/material';
import type { ReactNode } from 'react';

const Content = styled('div')(({ theme }) => ({
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(5),
}));

export const Main = ({ children }: { children: ReactNode }) => (
    <Content sx={{ ml: { md: '25%' } }}>{children}</Content>
);
