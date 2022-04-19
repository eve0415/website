import { Language, Twitter } from '@mui/icons-material';
import type { Project } from '.';
import { Crowdin, GitHub } from '../svg';

export const TranslatedProject: readonly Project[] = [
    {
        name: 'Zebra',
        description: '🦓 A Useful Package Manager for iOS',
        image: 'https://repository-images.githubusercontent.com/154848478/e9d26d80-6b6d-11e9-81ab-250514fec871',
        language: 'English',
        tag: ['jailbreak'],
        link: [
            {
                name: 'Homepage',
                url: 'https://getzbra.com/',
                svg: <Language />,
            },
            {
                name: 'Twitter',
                url: 'https://twitter.com/getZebra',
                svg: <Twitter sx={{ color: '#1D9BF0' }} />,
            },
            {
                name: 'GitHub',
                url: 'https://github.com/zbrateam/Zebra',
                svg: GitHub,
            },
            {
                name: 'Crowdin',
                url: 'https://crowdin.com/project/zebra',
                svg: Crowdin,
            },
        ],
    },
    {
        name: 'Sileo',
        description: 'A modern package manager for iOS 12 and higher.',
        image: 'https://getsileo.app/img/icon.png',
        language: 'English',
        tag: ['jailbreak'],
        link: [
            {
                name: 'Homepage',
                url: 'https://getsileo.app/',
                svg: <Language />,
            },
            {
                name: 'Twitter',
                url: 'https://twitter.com/GetSileo',
                svg: <Twitter sx={{ color: '#1D9BF0' }} />,
            },
            {
                name: 'GitHub',
                url: 'https://github.com/Sileo/Sileo',
                svg: GitHub,
            },
            {
                name: 'Crowdin',
                url: 'https://crowdin.com/project/sileo',
                svg: Crowdin,
            },
        ],
    },
    {
        name: 'Velocity',
        description: 'The modern, next-generation Minecraft server proxy.',
        image: 'https://raw.githubusercontent.com/PaperMC/velocitypowered.com/master/src/assets/img/velocity-blue.png',
        language: 'English',
        tag: null,
        link: [
            {
                name: 'Homepage',
                url: 'https://velocitypowered.com/',
                svg: <Language />,
            },
            {
                name: 'GitHub',
                url: 'https://github.com/PaperMC/Velocity',
                svg: GitHub,
            },
            {
                name: 'Crowdin',
                url: 'https://crowdin.com/project/velocity',
                svg: Crowdin,
            },
        ],
    },
    {
        name: 'Discord Bot List',
        description: 'The Best Discord Bots and Discord Servers',
        image: 'https://s3.amazonaws.com/cdn.freshdesk.com/data/helpdesk/attachments/production/73000283014/logo/YwHHVHQK5wK4heJQ35WTa0URACEyHcsnWA.png',
        language: 'English',
        tag: null,
        link: [
            {
                name: 'Homepage',
                url: 'https://top.gg/',
                svg: <Language />,
            },
            {
                name: 'Twitter',
                url: 'https://twitter.com/JoinTopgg',
                svg: <Twitter sx={{ color: '#1D9BF0' }} />,
            },
            {
                name: 'Crowdin',
                url: 'https://crowdin.com/project/topgg',
                svg: Crowdin,
            },
        ],
    },
] as const;
