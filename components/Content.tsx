import { styled } from '@mui/material';
import type { ReactNode } from 'react';
import { Navbar } from './Navbar';

const Content = styled('div')(({ theme }) => ({
    // minHeight: `calc(100vh - ${theme.spacing(20)})`,
    // marginLeft: { md: '25%' },
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(5),
}));

export function Main({ children }: { children: ReactNode }) {
    return (
        <>
            <Navbar />
            <Content sx={{ ml: { md: '25%' } }}>{children}</Content>
        </>
    );
}
