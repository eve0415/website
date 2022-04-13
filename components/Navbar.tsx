import { Close, Menu } from '@mui/icons-material';
import {
    Box,
    Container,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    SwipeableDrawer,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { pages } from './constants';

export function Navbar({ isOpen, open, close }: { isOpen: boolean; open: () => void; close: () => void }) {
    const router = useRouter();
    const theme = useTheme();

    useEffect(() => {
        if (isOpen) close();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router.pathname]);

    const content = (
        <Container sx={{ m: 'auto' }}>
            <List>
                {pages.map(({ title, icon, href }) => (
                    <Link key={href} href={href} passHref>
                        <ListItem>
                            <ListItemButton sx={{ height: 100 }} selected={router.pathname === href}>
                                <ListItemIcon
                                    sx={{
                                        color: router.pathname === href ? 'blueviolet' : 'inherit',
                                    }}
                                >
                                    {icon}
                                </ListItemIcon>
                                <ListItemText primary={title} />
                            </ListItemButton>
                        </ListItem>
                    </Link>
                ))}
            </List>
        </Container>
    );

    return (
        <>
            {useMediaQuery(theme.breakpoints.up('sm')) ? (
                <Drawer
                    open
                    variant='persistent'
                    PaperProps={{
                        sx: {
                            width: '25%',
                            opacity: 0.8,
                        },
                    }}
                >
                    {content}
                </Drawer>
            ) : (
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
                            {isOpen ? (
                                <Close sx={{ fontSize: '40px' }} />
                            ) : (
                                <Menu sx={{ fontSize: '40px' }} />
                            )}
                        </IconButton>
                    </Box>

                    <SwipeableDrawer open={isOpen} onOpen={open} onClose={close}>
                        {content}
                    </SwipeableDrawer>
                </>
            )}
        </>
    );
}
