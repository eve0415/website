import { Box, useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import type { ReactNode } from 'react';

// const Content = styled('div')(({ theme }) => ({
//     marginTop: theme.spacing(5),
//     marginBottom: theme.spacing(5),
// }));

// export const Main = ({ children }: { children: ReactNode }) => (
//     <Box h='100vh'>
//         <Box sx={{ ml: { md: '25%' } }}>{children}</Box>
//     </Box>
// );

export const Main = ({ children }: { children: ReactNode }) => (
    <Box
        pos='absolute'
        pl={useMediaQuery(`(min-width: ${useMantineTheme().breakpoints.md}px)`) ? '25%' : 0}
        w='100dvw'
        sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'auto',
        }}
    >
        {children}
    </Box>
);
