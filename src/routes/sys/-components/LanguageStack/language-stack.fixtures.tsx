import type { LanguageStat } from '../../-utils/github-stats-utils';

export const sampleLanguages: LanguageStat[] = [
  { name: 'TypeScript', percentage: 45.5, color: '#3178c6' },
  { name: 'JavaScript', percentage: 25.3, color: '#f1e05a' },
  { name: 'Rust', percentage: 12.2, color: '#dea584' },
  { name: 'Python', percentage: 8.5, color: '#3572A5' },
  { name: 'Go', percentage: 5.0, color: '#00ADD8' },
  { name: 'Shell', percentage: 3.5, color: '#89e051' },
];

export const singleLanguage: LanguageStat[] = [{ name: 'TypeScript', percentage: 100, color: '#3178c6' }];

export const twoLanguages: LanguageStat[] = [
  { name: 'JavaScript', percentage: 60.0, color: '#f1e05a' },
  { name: 'HTML', percentage: 40.0, color: '#e34c26' },
];

export const manyLanguages: LanguageStat[] = [
  { name: 'TypeScript', percentage: 30.0, color: '#3178c6' },
  { name: 'JavaScript', percentage: 20.0, color: '#f1e05a' },
  { name: 'Rust', percentage: 15.0, color: '#dea584' },
  { name: 'Python', percentage: 12.0, color: '#3572A5' },
  { name: 'Go', percentage: 10.0, color: '#00ADD8' },
  { name: 'Shell', percentage: 8.0, color: '#89e051' },
  { name: 'Java', percentage: 5.0, color: '#b07219' },
];

export const emptyLanguages: LanguageStat[] = [];
