import { styled } from '@mui/material';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Navbar } from './navbar';

const Content = styled('div')(({ theme }) => ({
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(5),
}));

export default function Main({ children }: { children: ReactNode }) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Navbar isOpen={open} open={() => setOpen(true)} close={() => setOpen(false)} />
            <Content sx={{ ml: { md: '25%' } }}>{children}</Content>
        </>
    );
}
