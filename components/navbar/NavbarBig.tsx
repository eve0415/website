import type { EmotionJSX } from '@emotion/react/types/jsx-namespace';
import { Center } from '@mantine/core';

export default function NavbarBig({ children }: { children: EmotionJSX.Element }) {
    return (
        <Center h='100dvh' w='25%' opacity={0.8} sx={{ flexDirection: 'column', backgroundColor: 'white' }}>
            {children}
        </Center>
    );
}
