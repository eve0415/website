import type { AdvancedProject } from '../interface';

import { crowdin, discord, github, homepage, twitter } from './icons';

export const localizedProjects: readonly AdvancedProject[] = [
  {
    name: 'Zebra',
    description: '🦓 A Useful Package Manager for iOS',
    image: 'https://github.com/zbrateam/zbrateam.github.io/blob/main/assets/banner.jpg?raw=true',
    links: [
      {
        svg: homepage,
        url: 'https://getzbra.com/',
      },
      {
        svg: discord,
        url: 'https://discord.gg/6CPtHBU',
      },
      {
        svg: twitter,
        url: 'https://twitter.com/getZebra',
      },
      {
        svg: github,
        url: 'https://github.com/zbrateam/Zebra',
      },
      {
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
        svg: homepage,
        url: 'https://getsileo.app/',
      },
      {
        svg: discord,
        url: 'https://getsileo.app/discord',
      },
      {
        svg: twitter,
        url: 'https://twitter.com/GetSileo',
      },
      {
        svg: github,
        url: 'https://github.com/Sileo/Sileo',
      },
      {
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
        svg: homepage,
        url: 'https://velocitypowered.com/',
      },
      {
        svg: discord,
        url: 'https://discord.gg/papermc',
      },
      {
        svg: github,
        url: 'https://github.com/PaperMC/Velocity',
      },
      {
        svg: crowdin,
        url: 'https://crowdin.com/project/velocity',
      },
    ],
  },
];
