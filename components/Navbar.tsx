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
import { useEffect, useState } from 'react';
import { pages } from './constants';

export function Navbar() {
    const router = useRouter();
    const theme = useTheme();
    const [open, setOpen] = useState(true);

    useEffect(() => {
        setOpen(false);
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
            {useMediaQuery(theme.breakpoints.up('sm')) ? null : (
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
                            onClick={() => setOpen(!open)}
                        >
                            {open ? <Close sx={{ fontSize: '40px' }} /> : <Menu sx={{ fontSize: '40px' }} />}
                        </IconButton>
                    </Box>

                    <SwipeableDrawer open={open} onOpen={() => setOpen(true)} onClose={() => setOpen(false)}>
                        {content}
                    </SwipeableDrawer>
                </>
            )}
            {useMediaQuery(theme.breakpoints.down('sm')) ? null : (
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
            )}
        </>
    );
}
