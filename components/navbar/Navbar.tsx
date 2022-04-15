import {
    Container,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    NoSsr,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { pages } from '../constants';
import type { NavbarOperation } from './Interface';

const NavbarBig = dynamic(() => import('./NavbarBig'), { ssr: false });
const NavbarSmall = dynamic(() => import('./NavbarSmall'), { ssr: false });

export function Navbar({ isOpen, open, close }: NavbarOperation) {
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
        <NoSsr>
            {useMediaQuery(theme.breakpoints.up('md')) ? (
                <NavbarBig>{content}</NavbarBig>
            ) : (
                <NavbarSmall isOpen={isOpen} open={open} close={close}>
                    {content}
                </NavbarSmall>
            )}
        </NoSsr>
    );
}
