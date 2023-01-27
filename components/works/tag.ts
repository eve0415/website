export const tagList = [
  {
    id: 'deprecated',
    name: 'Deprecated',
    description: '既にアーカイブされたプロジェクト、またはメンテされていないプロジェクトです',
  },
  {
    id: 'broken',
    name: '(Prob.) Broken',
    description: 'しばらくメンテされていないプロジェクトのため、正常に機能しない場合があります',
  },
  {
    id: 'jailbreak',
    name: 'Jailbreak',
    description: 'iOS/iPad OS 脱獄関連',
  },
] as const;

export type Tag = (typeof tagList)[number]['id'];
