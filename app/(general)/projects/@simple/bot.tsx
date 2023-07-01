import type { SimpleProject } from '../interface';

export const bots = [
  {
    name: 'DevTool',
    description: 'Discord から任意のコードを実行できるなどの開発者向け機能を備えたボットです',
    image: 'https://opengraph.githubassets.com/0415/eve0415/DevTool',
    url: 'https://github.com/eve0415/DevTool',
  },
  {
    name: 'TensorGame',
    description: 'TensorFlow.js を使って Discord でボードゲームできるボットです',
    image: 'https://opengraph.githubassets.com/0415/eve0415/TensorGame',
    url: 'https://github.com/eve0415/TensorGame',
  },
  {
    name: 'AnnoyYou',
    description: 'とにかくうざいボットです',
    image: 'https://opengraph.githubassets.com/0415/eve0415/AnnoyYou',
    url: 'https://github.com/eve0415/AnnoyYou',
  },
  {
    name: 'PinIt',
    description:
      '一昔前の、メンバーが 「メッセージの管理」権限を持たずしてもメッセージのピン止めができるようにするボットです。',
    image: 'https://opengraph.githubassets.com/0415/eve0415/PinIt',
    url: 'https://github.com/eve0415/PinIt',
  },
] satisfies readonly SimpleProject[];
