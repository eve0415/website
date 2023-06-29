import type { AdvancedProject } from '../interface';

import { crowdin, discord, github, homepage, twitter } from './icons';

export const localizedProjects: readonly AdvancedProject[] = [
  {
    name: 'Zebra',
    description: '🦓 A Useful Package Manager for iOS',
    image: 'https://github.com/zbrateam/zbrateam.github.io/blob/main/assets/banner.jpg?raw=true',
    links: [
      {
        name: 'Zebra',
        svg: homepage,
        url: 'https://getzbra.com/',
      },
      {
        name: 'Discord',
        svg: discord,
        url: 'https://discord.gg/6CPtHBU',
      },
      {
        name: 'Twitter',
        svg: twitter,
        url: 'https://twitter.com/getZebra',
      },
      {
        name: 'GitHub',
        svg: github,
        url: 'https://github.com/zbrateam/Zebra',
      },
      {
        name: 'Crowdin',
        svg: crowdin,
        url: 'https://crowdin.com/project/zebra',
      },
    ],
  },
  {
    name: 'Sileo',
    description: 'A modern package manager for iOS 12 and higher.',
    image: 'https://getsileo.app/img/icon.png',
    links: [
      {
        name: 'Sileo',
        svg: homepage,
        url: 'https://getsileo.app/',
      },
      {
        name: 'Discord',
        svg: discord,
        url: 'https://getsileo.app/discord',
      },
      {
        name: 'Twitter',
        svg: twitter,
        url: 'https://twitter.com/GetSileo',
      },
      {
        name: 'GitHub',
        svg: github,
        url: 'https://github.com/Sileo/Sileo',
      },
      {
        name: 'Crowdin',
        svg: crowdin,
        url: 'https://crowdin.com/project/sileo',
      },
    ],
  },
  {
    name: 'Velocity',
    description: 'The modern, next-generation Minecraft server proxy.',
    image:
      'https://raw.githubusercontent.com/PaperMC/velocitypowered.com/master/src/assets/img/velocity-blue.png',
    links: [
      {
        name: 'Velocity',
        svg: homepage,
        url: 'https://velocitypowered.com/',
      },
      {
        name: 'Discord',
        svg: discord,
        url: 'https://discord.gg/papermc',
      },
      {
        name: 'GitHub',
        svg: github,
        url: 'https://github.com/PaperMC/Velocity',
      },
      {
        name: 'Crowdin',
        svg: crowdin,
        url: 'https://crowdin.com/project/velocity',
      },
    ],
  },
];
