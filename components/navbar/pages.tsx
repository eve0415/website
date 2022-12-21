import { AiFillHome } from 'react-icons/ai';
import { MdContactPage, MdFace, MdWork } from 'react-icons/md';

export const pages = [
    {
        title: 'Home',
        icon: <AiFillHome />,
        href: '/',
    },
    {
        title: 'About Me',
        icon: <MdFace />,
        href: '/me',
    },
    {
        title: 'My Works',
        icon: <MdWork />,
        href: '/works',
    },
    {
        title: 'Socials',
        icon: <MdContactPage />,
        href: '/socials',
    },
] as const;
