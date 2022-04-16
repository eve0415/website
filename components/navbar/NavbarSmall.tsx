import type { EmotionJSX } from '@emotion/react/types/jsx-namespace';
import { Close, Menu } from '@mui/icons-material';
import { Box, IconButton, SwipeableDrawer } from '@mui/material';
import type { NavbarOperation } from './Interface';

export default function NavbarSmall({
    children,
    isOpen,
    open,
    close,
}: {
    children: EmotionJSX.Element;
} & NavbarOperation) {
    const iOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);

    return (
        <Box>
            <IconButton
                size='large'
                aria-label='Menu'
                onClick={() => (isOpen ? close() : open())}
                sx={{
                    backgroundColor: '#E5FCFB',
                    position: 'fixed',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 100,
                    width: 100,
                    top: -20,
                    left: -20,
                    zIndex: 1500,
                }}
            >
                {isOpen ? <Close sx={{ fontSize: '40px' }} /> : <Menu sx={{ fontSize: '40px' }} />}
            </IconButton>

            <SwipeableDrawer
                open={isOpen}
                onOpen={open}
                onClose={close}
                disableBackdropTransition={!iOS}
                disableDiscovery={iOS}
            >
                {children}
            </SwipeableDrawer>
        </Box>
    );
}
