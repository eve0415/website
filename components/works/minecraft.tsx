import { GitHub } from '../svg';
import type { Project } from './project';

export const MinecraftProject: readonly Project[] = [
    {
        name: 'IFPatcher',
        description: 'Industrial Foregoing 1.12.2用のバグを修正する mod です',
        image: 'https://raw.githubusercontent.com/eve0415/IFPatcher/main/src/main/resources/assets/ifpatcher/logo.png',
        language: 'Java',
        tag: null,
        link: [
            {
                name: 'CurseForge',
                url: 'https://www.curseforge.com/minecraft/mc-mods/ifpatcher',
                svg: (
                    <svg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
                        <path d='m6.307 5.581.391 1.675h-6.698s.112.502.167.558c.168.279.335.614.559.837 1.06 1.228 2.902 1.73 4.409 2.009 1.06.224 2.121.28 3.181.335l1.228 3.293h.67l.391 1.061h-.558l-.949 3.07h9.321l-.949-3.07h-.558l.39-1.061h.67s.558-3.404 2.288-4.967c1.675-1.563 3.74-1.786 3.74-1.786v-1.954zm9.377 8.428c-.447.279-.949.279-1.284.503-.223.111-.335.446-.335.446-.223-.502-.502-.67-.837-.781-.335-.112-.949-.056-1.786-.782-.558-.502-.614-1.172-.558-1.507v-.167c0-.056 0-.112.056-.168.111-.334.39-.669.948-.893 0 0-.39.559 0 1.117.224.335.67.502 1.061.279.167-.112.279-.335.335-.503.111-.39.111-.781-.224-1.06-.502-.446-.613-1.06-.279-1.451 0 0 .112.502.614.446.335 0 .335-.111.224-.223-.056-.167-.782-1.228.279-2.009 0 0 .669-.447 1.451-.391-.447.056-.949.335-1.116.782v.055c-.168.447-.056.949.279 1.396.223.335.502.614.614 1.06-.168-.056-.279 0-.391.112a.533.533 0 0 0 -.112.502c.056.112.168.223.279.223h.168c.167-.055.279-.279.223-.446.112.111.167.391.112.558 0 .167-.112.335-.168.446-.056.112-.167.224-.223.335-.056.112-.112.224-.112.335 0 .112 0 .279.056.391.223.335.67 0 .782-.279.167-.335.111-.726-.112-1.061 0 0 .391.224.67 1.005.223.67-.168 1.451-.614 1.73z' />
                    </svg>
                ),
            },
            {
                name: 'GitHub',
                url: 'https://github.com/eve0415/IFPatcher',
                svg: GitHub,
            },
        ],
    },
    {
        name: 'GregPatcher',
        description: 'GregTech Community Edition と Gregicality のバグを修正する mod です',
        image: 'https://opengraph.githubassets.com/0415/eve0415/GregPatcher',
        language: 'Kotlin',
        tag: ['deprecated'],
        link: [
            {
                name: 'GitHub',
                url: 'https://github.com/eve0415/GregPatcher',
                svg: GitHub,
            },
        ],
    },
    {
        name: 'MC-API',
        description: 'マイクラ関連のAPIのwrapperです',
        image: 'https://opengraph.githubassets.com/0415/eve0415/MC-API',
        language: 'TypeScript',
        tag: ['deprecated'],
        link: [
            {
                name: 'GitHub',
                url: 'https://github.com/eve0415/MC-API',
                svg: GitHub,
            },
        ],
    },
    {
        name: 'SpawnInternetProtocol',
        description: 'ユーザーのIP情報を基に、ワールド内でのスポーンを制御するプラグインです',
        image: 'https://opengraph.githubassets.com/0415/disboardorg/SpawnInternetProtocol',
        language: 'Kotlin',
        tag: ['deprecated'],
        link: [
            {
                name: 'GitHub',
                url: 'https://github.com/disboardorg/SpawnInternetProtocol',
                svg: GitHub,
            },
        ],
    },
] as const;
