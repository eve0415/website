// Privacy filtering for GitHub data
// Ensures private repos and hidden org names are never exposed

import type { Repo } from '#db/types';
import type { GitHubRepo, PrivacyClass } from './ai-skills-types';

import { HIDDEN_ORGS } from './ai-skills-types';

const GITHUB_USERNAME = 'eve0415';

/**
 * Classify repository privacy level
 *
 * - self: Public repos owned by eve0415 → can show name
 * - member-org: Hidden orgs (DigitaltalPlayground, Wideplink) → aggregate only
 * - private: Any private repo → aggregate only
 * - external: OSS contributions → can show name
 */
export const classifyRepo = (repo: GitHubRepo): PrivacyClass => {
  // Private repos are always hidden
  if (repo.private) return 'private';

  const owner = repo.owner.login.toLowerCase();

  // Hidden organizations - aggregate only
  if (HIDDEN_ORGS.some(org => org.toLowerCase() === owner)) return 'member-org';

  // Owned by eve0415 - can show
  if (owner === GITHUB_USERNAME.toLowerCase()) return 'self';

  // External OSS - can show
  return 'external';
};

/**
 * Check if repo name can be shown publicly
 */
export const canShowRepoName = (repo: Repo | { privacyClass: PrivacyClass }): boolean => repo.privacyClass === 'self' || repo.privacyClass === 'external';

/**
 * Get display name for repo (anonymized if needed)
 */
export const getRepoDisplayName = (repo: Repo): string => {
  if (canShowRepoName(repo)) return repo.fullName;

  // Anonymize: show language/type hint only
  const hint = repo.language ? `${repo.language} project` : 'project';
  return `[private ${hint}]`;
};

/**
 * Anonymize commit message if from private repo
 * Removes specific identifiers while keeping technical content
 */
export const anonymizeCommitMessage = (message: string, repo: Repo): string => {
  if (canShowRepoName(repo)) return message;

  // Keep first line only, truncate
  const firstLine = message.split('\n')[0] ?? message;
  const truncated = firstLine.slice(0, 80);

  // Remove potential identifiers (URLs, @mentions, issue refs)
  return truncated
    .replaceAll(/@[\w-]+/g, '@[user]')
    .replaceAll(/#\d+/g, '#[ref]')
    .replaceAll(/https?:\/\/[^\s]+/g, '[url]');
};

/**
 * Filter sensitive content from AI prompt context
 * Ensures no private repo names leak into AI-generated text
 */
export const sanitizeForAI = (text: string, privateRepoNames: string[]): string => {
  let result = text;

  for (const name of privateRepoNames) {
    // Replace full_name and just repo name
    const parts = name.split('/');
    const repoName = parts[1] ?? name;

    result = result.replaceAll(new RegExp(name, 'gi'), '[private-repo]');
    result = result.replaceAll(new RegExp(`\\b${repoName}\\b`, 'gi'), '[private]');
  }

  return result;
};

/**
 * Create aggregate stats message for hidden repos
 * Used in progress display
 */
export const createAggregateMessage = (phase: string, publicCount: number, privateCount: number, currentPublicRepo?: string): string => {
  if (currentPublicRepo) return `${phase}: ${currentPublicRepo}`;

  if (privateCount > 0 && publicCount === 0) return `${phase}: analyzing private repositories...`;

  if (privateCount > 0) return `${phase}: ${publicCount} public + ${privateCount} private repos`;

  return `${phase}: ${publicCount} repositories`;
};
