import type { AISkill } from '#workflows/-utils/ai-skills-types';

export const expertSkill: AISkill = {
  name: 'TypeScript',
  category: 'language',
  level: 'expert',
  confidence: 0.95,
  description_ja: '型安全なJavaScript開発に精通。大規模アプリケーションでの型システム設計経験が豊富。',
  evidence: ['100+ commits with strict TypeScript', 'Type-safe API designs', 'Complex generic patterns'],
  last_active: '2024-01-15T10:00:00Z',
  trend: 'rising',
  is_ai_discovered: false,
};

export const proficientSkill: AISkill = {
  name: 'Kubernetes',
  category: 'infrastructure',
  level: 'proficient',
  confidence: 0.8,
  description_ja: 'コンテナオーケストレーションの実務経験。本番環境でのクラスタ運用経験あり。',
  evidence: ['Helm chart development', 'Production deployments'],
  last_active: '2024-01-10T10:00:00Z',
  trend: 'stable',
  is_ai_discovered: false,
};

export const learningSkill: AISkill = {
  name: 'Rust',
  category: 'language',
  level: 'learning',
  confidence: 0.45,
  description_ja: 'システムプログラミング言語として学習中。所有権システムの理解を深めている段階。',
  evidence: ['Side project experiments'],
  last_active: '2023-12-01T10:00:00Z',
  trend: 'declining',
  is_ai_discovered: true,
};

export const aiDiscoveredSkill: AISkill = {
  name: 'GraphQL',
  category: 'domain',
  level: 'proficient',
  confidence: 0.75,
  description_ja: 'APIスキーマ設計とクエリ最適化に関する実務経験。',
  evidence: ['Schema design', 'Resolver implementation', 'Query optimization'],
  last_active: '2024-01-12T10:00:00Z',
  trend: 'rising',
  is_ai_discovered: true,
};

export const skillWithNoEvidence: AISkill = {
  name: 'Deno',
  category: 'infrastructure',
  level: 'learning',
  confidence: 0.3,
  description_ja: '新しいJavaScriptランタイムとして調査中。',
  evidence: [],
  last_active: '2023-11-01T10:00:00Z',
  trend: 'stable',
  is_ai_discovered: true,
};
