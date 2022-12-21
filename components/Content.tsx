import { Box } from '@mantine/core';
import type { ReactNode } from 'react';

export const Main = ({ children, margin }: { children: ReactNode; margin?: number }) => (
    <Box
        pos='absolute'
        w='100%'
        sx={theme => ({
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'auto',
            marginTop: margin ?? 70,
            paddingBottom: margin ?? 100,
            [`@media (min-width: ${theme.breakpoints.md}px)`]: { paddingLeft: '25%' },
        })}
    >
        {children}
    </Box>
);
