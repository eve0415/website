import type { EmotionJSX } from '@emotion/react/types/jsx-namespace';
import { Box, Burger, Button, Drawer } from '@mantine/core';
import type { NavbarOperation } from './Interface';

export default function NavbarSmall({
    children,
    isOpen,
    open,
    close,
}: { children: EmotionJSX.Element } & NavbarOperation) {
    // const iOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);

    <Box pos='fixed' h={100} w={100} top={-20} left={-20}>
        <Burger opened />
    </Box>;

    return (
        <Button
            size='xl'
            variant='subtle'
            h={100}
            w={100}
            sx={{ top: -20, left: -20, zIndex: 1000, borderRadius: '50%', backgroundColor: '#E5FCFB' }}
            onClick={() => (isOpen ? close() : open())}
        >
            <Burger opened={isOpen} />
            <Drawer withCloseButton={false} opened={isOpen} onClose={close}>
                {/* {children} */}
                <Box
                    h='100dvh'
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {children}
                </Box>
            </Drawer>
        </Button>
    );

    // return (
    //     <>
    //         <Box
    //             sx={{ backgroundColor: '#E5FCFB' }}
    //             position='fixed'
    //             height={100}
    //             width={100}
    //             left={-20}
    //             top={-20}
    //             borderRadius='50%'
    //             display='flex'
    //             alignItems='center'
    //             justifyContent='center'
    //             zIndex={1500}
    //         >
    //             <IconButton size='large' aria-label='Menu' onClick={() => (isOpen ? close() : open())}>
    //                 {isOpen ? <Close sx={{ fontSize: '40px' }} /> : <Menu sx={{ fontSize: '40px' }} />}
    //             </IconButton>
    //         </Box>

    //         <SwipeableDrawer
    //             open={isOpen}
    //             onOpen={open}
    //             onClose={close}
    //             disableBackdropTransition={!iOS}
    //             disableDiscovery={iOS}
    //         >
    //             {children}
    //         </SwipeableDrawer>
    //     </>
    // );
}
