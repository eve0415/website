import type { Skill } from '../../-config/skills-config';

export const expertSkill: Skill = {
  name: 'TypeScript',
  category: 'language',
  level: 'expert',
  description: '主要開発言語。型安全なコードベース構築に活用',
};

export const proficientSkill: Skill = {
  name: 'Kubernetes',
  category: 'infrastructure',
  level: 'proficient',
  description: 'オーケストレーション',
};

export const learningSkill: Skill = {
  name: 'Rust',
  category: 'language',
  level: 'learning',
  description: 'システムプログラミング学習中',
};

export const skillWithoutDescription: Skill = {
  name: 'Go',
  category: 'language',
  level: 'learning',
};

export const domainSkill: Skill = {
  name: 'Discord Bots',
  category: 'domain',
  level: 'expert',
  description: '複数の本番Bot開発経験',
};

export const infrastructureSkill: Skill = {
  name: 'Docker',
  category: 'infrastructure',
  level: 'expert',
  description: 'コンテナ化の標準ツール',
};
