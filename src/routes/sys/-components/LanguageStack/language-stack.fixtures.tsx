import type { LanguageStat } from '../../-utils/github-stats-utils';

export const sampleLanguages: LanguageStat[] = [
  { name: 'TypeScript', percentage: 45.5, color: '#3178c6' },
  { name: 'JavaScript', percentage: 25.3, color: '#f1e05a' },
  { name: 'Rust', percentage: 12.2, color: '#dea584' },
  { name: 'Python', percentage: 8.5, color: '#3572A5' },
  { name: 'Go', percentage: 5, color: '#00ADD8' },
  { name: 'Shell', percentage: 3.5, color: '#89e051' },
];

export const singleLanguage: LanguageStat[] = [{ name: 'TypeScript', percentage: 100, color: '#3178c6' }];

export const twoLanguages: LanguageStat[] = [
  { name: 'JavaScript', percentage: 60, color: '#f1e05a' },
  { name: 'HTML', percentage: 40, color: '#e34c26' },
];

export const manyLanguages: LanguageStat[] = [
  { name: 'TypeScript', percentage: 30, color: '#3178c6' },
  { name: 'JavaScript', percentage: 20, color: '#f1e05a' },
  { name: 'Rust', percentage: 15, color: '#dea584' },
  { name: 'Python', percentage: 12, color: '#3572A5' },
  { name: 'Go', percentage: 10, color: '#00ADD8' },
  { name: 'Shell', percentage: 8, color: '#89e051' },
  { name: 'Java', percentage: 5, color: '#b07219' },
];

export const emptyLanguages: LanguageStat[] = [];
