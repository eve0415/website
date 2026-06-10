// Privacy filtering for GitHub data
// Ensures private repos and hidden org names are never exposed

import type { Repo } from '#db/types';
import type { GitHubRepo, PrivacyClass } from './ai-skills-types';

import { GITHUB_USERNAME } from '#lib/github-client';

import { HIDDEN_ORGS } from './ai-skills-types';

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
  return repo.language ? `非公開の${repo.language}プロジェクト` : '非公開プロジェクト';
};

// Repo names can contain regex metacharacters (e.g. ".") - escape before
// building a pattern from them
const escapeRegExp = (value: string): string => value.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);

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

    result = result.replaceAll(new RegExp(escapeRegExp(name), 'gi'), '[private-repo]');
    result = result.replaceAll(new RegExp(String.raw`\b${escapeRegExp(repoName)}\b`, 'gi'), '[private]');
  }

  return result;
};
