import type { SimpleProject } from '../interface';

export const minecraft = [
  {
    name: 'Cropper',
    description: '右クリックで食物の収穫、葉っぱが早く枯れるなどの機能を追加するプラグインです',
    image: 'https://opengraph.githubassets.com/0415/eve0415/Cropper',
    url: 'https://github.com/eve0415/Cropper',
  },
  {
    name: 'GregPatcher',
    description: 'GregTech Community Edition と Gregicality のバグを修正する mod です',
    image: 'https://opengraph.githubassets.com/0415/eve0415/GregPatcher',
    url: 'https://github.com/eve0415/GregPatcher',
  },
  {
    name: 'SpawnInternetProtocol',
    description: 'ユーザーのIP情報を基に、ワールド内でのスポーン位置を制御するプラグインです',
    image: 'https://opengraph.githubassets.com/0415/disboardorg/SpawnInternetProtocol',
    url: 'https://github.com/disboardorg/SpawnInternetProtocol',
  },
] satisfies readonly SimpleProject[];
