export interface Skill {
  name: string;
  category: 'language' | 'infrastructure' | 'domain';
  level: 'expert' | 'proficient' | 'learning';
  description?: string;
}

export const skills: Skill[] = [
  // Languages
  {
    name: 'TypeScript',
    category: 'language',
    level: 'expert',
    description: '主要開発言語。型安全なコードベース構築に活用',
  },
  {
    name: 'JavaScript',
    category: 'language',
    level: 'expert',
    description: 'フルスタック開発の基盤',
  },
  {
    name: 'Java',
    category: 'language',
    level: 'proficient',
    description: 'Minecraft mod開発で使用',
  },
  {
    name: 'Kotlin',
    category: 'language',
    level: 'proficient',
    description: 'JVM言語の代替として学習',
  },
  {
    name: 'Rust',
    category: 'language',
    level: 'learning',
    description: 'システムプログラミング学習中',
  },
  { name: 'Go', category: 'language', level: 'learning', description: 'インフラツーリング学習中' },
  {
    name: 'Python',
    category: 'language',
    level: 'proficient',
    description: 'スクリプトとデータ処理',
  },
  // Infrastructure
  {
    name: 'Docker',
    category: 'infrastructure',
    level: 'expert',
    description: 'コンテナ化の標準ツール',
  },
  {
    name: 'Kubernetes',
    category: 'infrastructure',
    level: 'proficient',
    description: 'オーケストレーション',
  },
  {
    name: 'Cloudflare',
    category: 'infrastructure',
    level: 'expert',
    description: 'このサイトもCloudflare Workersで動作',
  },
  {
    name: 'GitHub Actions',
    category: 'infrastructure',
    level: 'expert',
    description: 'CI/CD自動化',
  },
  {
    name: 'OpenTelemetry',
    category: 'infrastructure',
    level: 'proficient',
    description: '可観測性の実装',
  },
  // Domains
  {
    name: 'Discord Bots',
    category: 'domain',
    level: 'expert',
    description: '複数の本番Bot開発経験',
  },
  {
    name: 'Web Development',
    category: 'domain',
    level: 'expert',
    description: 'フロントエンドからバックエンドまで',
  },
  {
    name: 'Minecraft Mods',
    category: 'domain',
    level: 'proficient',
    description: 'IFPatcherで795k+ダウンロード',
  },
  { name: 'DevTools', category: 'domain', level: 'proficient', description: '開発者体験の改善' },
];

export const categoryLabels: Record<string, string> = {
  language: '言語',
  infrastructure: 'インフラ',
  domain: 'ドメイン',
};

export const categoryIcons: Record<string, string> = {
  language: '</>',
  infrastructure: '⚙',
  domain: '◈',
};

export const levelConfig = {
  expert: { color: 'neon', label: 'Expert', progress: 100 },
  proficient: { color: 'cyan', label: 'Proficient', progress: 70 },
  learning: { color: 'orange', label: 'Learning', progress: 35 },
};
