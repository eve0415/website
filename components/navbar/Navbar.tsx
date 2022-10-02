import {
    Container,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import type { NavbarOperation } from './Interface';
import { pages } from './pages';

const NavbarBig = dynamic(() => import('./NavbarBig'), { ssr: false });
const NavbarSmall = dynamic(() => import('./NavbarSmall'), { ssr: false });

export const Navbar = ({ isOpen, open, close }: NavbarOperation) => {
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
                    <Link key={href} href={href} passHref style={{ textDecoration: 'none', color: 'black' }}>
                        <ListItem sx={{ borderRadius: 0.5 }}>
                            <ListItemButton sx={{ height: 60 }} selected={router.pathname === href}>
                                <ListItemIcon
                                    sx={{
                                        color: router.pathname === href ? 'blueviolet' : 'inherit',
                                        minWidth: 40,
                                    }}
                                >
                                    {icon}
                                </ListItemIcon>
                                <ListItemText
                                    primaryTypographyProps={{ fontSize: { md: 20, lg: 25 } }}
                                    primary={title}
                                />
                            </ListItemButton>
                        </ListItem>
                    </Link>
                ))}
            </List>
        </Container>
    );

    return useMediaQuery(theme.breakpoints.up('md')) ? (
        <NavbarBig>{content}</NavbarBig>
    ) : (
        <NavbarSmall isOpen={isOpen} open={open} close={close}>
            {content}
        </NavbarSmall>
    );
};
