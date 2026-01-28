import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';

import AnalysisLog from './analysis-log';
import {
  aiExtractingSkillsState,
  aiGeneratingJapaneseState,
  completedState,
  errorState,
  fetchingCommitsState,
  fetchingPRsState,
  fetchingReviewsState,
  idleState,
  listingReposState,
  squashingHistoryState,
  storingResultsState,
} from './analysis-log.fixtures';

describe('analysisLog', () => {
  describe('phase messages', () => {
    test('renders idle phase message', async () => {
      await render(<AnalysisLog state={idleState} />);

      await expect.element(page.getByText('IDLE')).toBeInTheDocument();
    });

    test('renders listing-repos phase message', async () => {
      await render(<AnalysisLog state={listingReposState} />);

      await expect.element(page.getByText('LIVE ANALYZING')).toBeInTheDocument();
      await expect.element(page.getByText('リポジトリを取得中...')).toBeInTheDocument();
    });

    test('renders fetching-commits phase message', async () => {
      await render(<AnalysisLog state={fetchingCommitsState} />);

      await expect.element(page.getByText('コミット履歴を取得中...')).toBeInTheDocument();
    });

    test('renders fetching-prs phase message', async () => {
      await render(<AnalysisLog state={fetchingPRsState} />);

      await expect.element(page.getByText('プルリクエストを取得中...')).toBeInTheDocument();
    });

    test('renders fetching-reviews phase message', async () => {
      await render(<AnalysisLog state={fetchingReviewsState} />);

      await expect.element(page.getByText('レビューを取得中...')).toBeInTheDocument();
    });

    test('renders squashing-history phase message', async () => {
      await render(<AnalysisLog state={squashingHistoryState} />);

      await expect.element(page.getByText('履歴を要約中...')).toBeInTheDocument();
    });

    test('renders ai-extracting-skills phase message', async () => {
      await render(<AnalysisLog state={aiExtractingSkillsState} />);

      await expect.element(page.getByText('AIがスキルを分析中...')).toBeInTheDocument();
    });

    test('renders ai-generating-japanese phase message', async () => {
      await render(<AnalysisLog state={aiGeneratingJapaneseState} />);

      await expect.element(page.getByText('AI説明文を生成中...')).toBeInTheDocument();
    });

    test('renders storing-results phase message', async () => {
      await render(<AnalysisLog state={storingResultsState} />);

      await expect.element(page.getByText('結果を保存中...')).toBeInTheDocument();
    });

    test('renders completed phase message', async () => {
      const { container } = await render(<AnalysisLog state={completedState} />);

      // Check for COMPLETE status text in header
      expect(container.textContent).toContain('COMPLETE');
    });

    test('renders error phase message', async () => {
      await render(<AnalysisLog state={errorState} />);

      await expect.element(page.getByText('Rate limit exceeded. Please try again later.')).toBeInTheDocument();
    });
  });

  describe('progress percentage', () => {
    test('shows progress percentage when active', async () => {
      await render(<AnalysisLog state={fetchingCommitsState} />);

      // 25%
      await expect.element(page.getByText('25%')).toBeInTheDocument();
    });

    test('does not show progress percentage when idle', async () => {
      const { container } = await render(<AnalysisLog state={idleState} />);

      // Should not have percentage display
      const percentageElements = container.querySelectorAll('.text-fuchsia.font-mono.text-xs');
      const hasPercentage = Array.from(percentageElements).some(el => el.textContent?.includes('%'));
      expect(hasPercentage).toBeFalsy();
    });

    test('does not show progress percentage when completed', async () => {
      const { container } = await render(<AnalysisLog state={completedState} />);

      // Header should show COMPLETE, not percentage
      const header = container.querySelector('.border-b');
      expect(header?.textContent).toContain('COMPLETE');
      expect(header?.textContent).not.toContain('100%');
    });
  });

  describe('repo stats', () => {
    test('shows repo stats when repos_total > 0', async () => {
      await render(<AnalysisLog state={fetchingCommitsState} />);

      // 2/10 repos
      await expect.element(page.getByText('2/10 repos')).toBeInTheDocument();
    });

    test('does not show repo stats when repos_total is 0', async () => {
      const { container } = await render(<AnalysisLog state={listingReposState} />);

      // Footer should not exist
      const footer = container.querySelector('.border-t.px-3.py-2');
      expect(footer).toBeNull();
    });
  });

  describe('current repo display', () => {
    test('shows current repo name when provided', async () => {
      await render(<AnalysisLog state={fetchingCommitsState} />);

      // current_repo is 'eve0415/website'
      await expect.element(page.getByText('Scanning eve0415/website...')).toBeInTheDocument();
    });

    test('does not show repo name when current_repo is null', async () => {
      const { container } = await render(<AnalysisLog state={squashingHistoryState} />);

      // Should not have "Scanning" text
      expect(container.textContent).not.toContain('Scanning');
    });
  });

  describe('status indicator', () => {
    test('shows animated indicator when active', async () => {
      const { container } = await render(<AnalysisLog state={fetchingCommitsState} />);

      const indicator = container.querySelector('.animate-heartbeat');
      expect(indicator).not.toBeNull();
    });

    test('shows green indicator when completed', async () => {
      const { container } = await render(<AnalysisLog state={completedState} />);

      const indicator = container.querySelector('.bg-neon');
      expect(indicator).not.toBeNull();
    });

    test('shows muted indicator when idle', async () => {
      const { container } = await render(<AnalysisLog state={idleState} />);

      const indicator = container.querySelector('.bg-muted');
      expect(indicator).not.toBeNull();
    });
  });

  describe('blinking cursor', () => {
    test('cursor character exists when active', async () => {
      const { container } = await render(<AnalysisLog state={fetchingCommitsState} />);

      // Cursor is rendered as underscore character with toggling opacity
      expect(container.textContent).toContain('_');
    });
  });
});
