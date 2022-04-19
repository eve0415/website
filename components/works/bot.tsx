import { GitHub } from '../svg';
import type { Project } from '.';

export const BotProject: readonly Project[] = [
    {
        name: 'DevTool',
        description: 'Discord から任意のコードを実行できるなどの開発者向け機能を備えたボットです',
        image: 'https://opengraph.githubassets.com/0415/eve0415/DevTool',
        language: 'Typescript',
        tag: null,
        link: [
            {
                name: 'GitHub',
                url: 'https://github.com/eve0415/DevTool',
                svg: GitHub,
            },
        ],
    },
    {
        name: 'TensorGame',
        description: 'TensorFlow.js を使って Discord でボードゲームできるボットです',
        image: 'https://opengraph.githubassets.com/0415/eve0415/TensorGame',
        language: 'Typescript',
        tag: null,
        link: [
            {
                name: 'GitHub',
                url: 'https://github.com/eve0415/TensorGame',
                svg: GitHub,
            },
        ],
    },
    {
        name: 'AnnoyYou',
        description: 'とにかくうざいボットです',
        image: 'https://opengraph.githubassets.com/0415/eve0415/AnnoyYou',
        language: 'Typescript',
        tag: ['deprecated'],
        link: [
            {
                name: 'GitHub',
                url: 'https://github.com/eve0415/AnnoyYou',
                svg: GitHub,
            },
        ],
    },
    {
        name: 'PinIt',
        description:
            '一昔前の、メンバーが 「メッセージの管理」権限を持たずしてもメッセージのピン止めができるようにするボットです。',
        image: 'https://opengraph.githubassets.com/0415/eve0415/PinIt',
        language: 'JavaScript',
        tag: ['deprecated'],
        link: [
            {
                name: 'PinIt',
                url: 'https://github.com/eve0415/PinIt',
                svg: GitHub,
            },
        ],
    },
] as const;
