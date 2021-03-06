import type { LinkCard } from '.';

export const editor: readonly LinkCard[] = [
    {
        name: 'Visual Studio Code',
        url: 'https://code.visualstudio.com/',
        svg: (
            <>
                <path
                    d='M3.656 45.043s-3.027-2.191.61-5.113l8.468-7.594s2.426-2.559 4.989-.328l78.175 59.328v28.45s-.039 4.468-5.757 3.976zm0 0'
                    fill='#2489ca'
                />
                <path
                    d='M23.809 63.379L3.656 81.742s-2.07 1.543 0 4.305l9.356 8.527s2.222 2.395 5.508-.328l21.359-16.238zm0 0'
                    fill='#1070b3'
                />
                <path
                    d='M59.184 63.531l36.953-28.285-.239-28.297S94.32.773 89.055 3.99L39.879 48.851zm0 0'
                    fill='#0877b9'
                />
                <path
                    d='M90.14 123.797c2.145 2.203 4.747 1.48 4.747 1.48l28.797-14.222c3.687-2.52 3.171-5.645 3.171-5.645V20.465c0-3.735-3.812-5.024-3.812-5.024L98.082 3.38c-5.453-3.379-9.027.61-9.027.61s4.593-3.317 6.843 2.96v112.317c0 .773-.164 1.53-.492 2.214-.656 1.332-2.086 2.57-5.504 2.051zm0 0'
                    fill='#3c99d4'
                />
            </>
        ),
    },
    {
        name: 'IntelliJ IDEA',
        url: 'https://www.jetbrains.com/idea/',
        svg: (
            <>
                <path
                    fill='#fa930d'
                    d='M5.55 64.73a17.08 17.08 0 1017.08-17.09A17.11 17.11 0 005.55 64.73z'
                />
                <path
                    fill='#136ba2'
                    d='M107.48 4.73c-9.39 0-15 7.56-15 20.23v77.8c0 12.66 5.59 20.23 15 20.23s15-7.56 15-20.23V25c-.03-12.7-5.63-20.27-15-20.27zM81.25 6.38H19.88a14.92 14.92 0 000 29.81v.11h31.41v28.4a28.7 28.7 0 01-28.63 28.7h-.77l-.08.1c-.42 0-.85-.07-1.29-.07a14.94 14.94 0 100 29.87c.45 0 .9 0 1.34-.07v.05h.78a58.65 58.65 0 0058.61-58.55v-.54-9.59-.11V6.38z'
                />
            </>
        ),
    },
    {
        name: 'Webstorm',
        url: 'https://www.jetbrains.com/webstorm/',
        svg: (
            <>
                <path
                    fill='#2788b5'
                    d='M75.78 113.66c1.28-1.6 2.79-3.36 4.58-5.42l.89-1c1.11-1.29 2-2.28 2.93-3.24a70.64 70.64 0 006.09-7.36c2.74-3.74 4.51-6.55 4.22-11.37-.14-2.48-.24-4.18-1.86-6.18a66.7 66.7 0 00-4.69-4.78c-2.07-2-3.87-3.9-6.31-6.44s-5.6-9-5.6-9a41.4 41.4 0 01-3.19-10.74l-7.18-36.8H45.22l-10 46.41-8.87-46.46H2.22L24 116.72h20.32l10.17-45.64 9 45.64h9.44z'
                />
                <path
                    fill='#fa930d'
                    d='M118.34 17.59c2.14-2.48 3.9-4.48 5.34-6.3H91.24c-1.93 2.46-5.85 7.21-8.09 11.43-3 5.58-5.39 9.76-5.63 20l.11 3.31c0 4.9 3.5 12.08 3.5 12.08a43.35 43.35 0 003.58 5.61l.65.85c3.5 4 8.78 8.48 11.12 11.35 2.73 3.37 2.8 6.53 3 9 .39 6.65-2.29 10.65-5.17 14.58-4.35 5.93-5.92 7-9.27 10.91-2.14 2.47-3.89 4.48-5.34 6.29h33.51a90.25 90.25 0 007-11.42c3-5.58 5.39-9.76 5.63-20l-.16-3.28c0-4.9-3.5-12.09-3.5-12.09a44.31 44.31 0 00-3.59-5.61l-.64-.85c-3.5-4-8.79-8.48-11.12-11.35-2.73-3.38-2.8-6.54-3-9-.4-6.64 2.29-10.65 5.17-14.58 4.42-5.95 6-7.06 9.34-10.93z'
                />
            </>
        ),
    },
] as const;
