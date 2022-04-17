import { ContactPage, Face, Home, Work } from '@mui/icons-material';

export const pages = [
    {
        title: 'Home',
        icon: <Home sx={{ fontSize: { md: 25, lg: 30 } }} />,
        href: '/',
    },
    {
        title: 'About Me',
        icon: <Face sx={{ fontSize: { md: 25, lg: 30 } }} />,
        href: '/me',
    },
    {
        title: 'My Works',
        icon: <Work sx={{ fontSize: { md: 25, lg: 30 } }} />,
        href: '/works',
    },
    {
        title: 'Socials',
        icon: <ContactPage sx={{ fontSize: { md: 25, lg: 30 } }} />,
        href: '/socials',
    },
] as const;
