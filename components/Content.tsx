import { Box, useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import type { ReactNode } from 'react';

export const Main = ({ children, margin }: { children: ReactNode; margin?: number }) => (
    <Box
        pos='absolute'
        pl={useMediaQuery(`(min-width: ${useMantineTheme().breakpoints.md}px)`) ? '25%' : 0}
        w='100%'
        sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'auto',
            marginTop: margin ?? 40,
            marginBottom: margin ?? 40,
        }}
    >
        {children}
    </Box>
);
