import { ContactPage, Face, Home, Work } from '@mui/icons-material';

export const pages = [
    {
        title: 'Home',
        icon: <Home />,
        href: '/',
    },
    {
        title: 'About Me',
        icon: <Face />,
        href: '/me',
    },
    {
        title: 'My Works',
        icon: <Work />,
        href: '/works',
    },
    {
        title: 'Socials',
        icon: <ContactPage />,
        href: '/socials',
    },
] as const;
