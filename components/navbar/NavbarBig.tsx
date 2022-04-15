import type { EmotionJSX } from '@emotion/react/types/jsx-namespace';
import { Drawer } from '@mui/material';

export default function NavbarBig({ children }: { children: EmotionJSX.Element }) {
    return (
        <Drawer
            open
            variant='permanent'
            sx={{
                opacity: 0.8,
                '& .MuiDrawer-paper': {
                    width: '25%',
                    boxSizing: 'border-box',
                },
            }}
        >
            {children}
        </Drawer>
    );
}
