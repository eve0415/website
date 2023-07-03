import type { AdvancedProject } from '../interface';

import { curseforge, github } from './icons';

export const minecraft: readonly AdvancedProject[] = [
  {
    name: 'IFPatcher',
    description: 'Industrial Foregoing 1.12.2用のバグを修正する mod です',
    image:
      'https://raw.githubusercontent.com/eve0415/IFPatcher/main/src/main/resources/assets/ifpatcher/logo.png',
    links: [
      {
        name: 'CurseForge',
        svg: curseforge,
        url: 'https://www.curseforge.com/minecraft/mc-mods/ifpatcher',
      },
      {
        name: 'GitHub',
        svg: github,
        url: 'https://github.com/eve0415/IFPatcher',
      },
    ],
  },
];
