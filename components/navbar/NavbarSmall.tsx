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
    return (
        <>
            <Box
                sx={{ backgroundColor: '#E5FCFB' }}
                position='fixed'
                height={100}
                width={100}
                left={-20}
                top={-20}
                borderRadius='50%'
                display='flex'
                alignItems='center'
                justifyContent='center'
                zIndex={10000}
            >
                <IconButton
                    size='large'
                    aria-label='Menu'
                    sx={{ borderRadius: '50%' }}
                    onClick={() => (isOpen ? close() : open())}
                >
                    {isOpen ? <Close sx={{ fontSize: '40px' }} /> : <Menu sx={{ fontSize: '40px' }} />}
                </IconButton>
            </Box>

            <SwipeableDrawer open={isOpen} onOpen={open} onClose={close}>
                {children}
            </SwipeableDrawer>
        </>
    );
}
