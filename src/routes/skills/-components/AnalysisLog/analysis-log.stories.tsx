import { expect, within } from 'storybook/test';

import preview from '#.storybook/preview';

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

const meta = preview.meta({
  component: AnalysisLog,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    Story => (
      <div className='bg-bg-primary relative h-screen w-full'>
        <Story />
      </div>
    ),
  ],
});

export const Idle = meta.story({
  args: {
    state: idleState,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('IDLE')).toBeInTheDocument();
  },
});

export const ListingRepos = meta.story({
  args: {
    state: listingReposState,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('LIVE ANALYZING')).toBeInTheDocument();
    await expect(canvas.getByText('リポジトリを取得中...')).toBeInTheDocument();
  },
});

export const FetchingCommits = meta.story({
  args: {
    state: fetchingCommitsState,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('コミット履歴を取得中...')).toBeInTheDocument();
    await expect(canvas.getByText('Scanning eve0415/website...')).toBeInTheDocument();
    await expect(canvas.getByText('2/10 repos')).toBeInTheDocument();
  },
});

export const FetchingPRs = meta.story({
  args: {
    state: fetchingPRsState,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('プルリクエストを取得中...')).toBeInTheDocument();
    await expect(canvas.getByText('40%')).toBeInTheDocument();
  },
});

export const FetchingReviews = meta.story({
  args: {
    state: fetchingReviewsState,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('レビューを取得中...')).toBeInTheDocument();
  },
});

export const SquashingHistory = meta.story({
  args: {
    state: squashingHistoryState,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('履歴を要約中...')).toBeInTheDocument();
    await expect(canvas.getByText('70%')).toBeInTheDocument();
  },
});

export const AIExtractingSkills = meta.story({
  args: {
    state: aiExtractingSkillsState,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('AIがスキルを分析中...')).toBeInTheDocument();
    await expect(canvas.getByText('80%')).toBeInTheDocument();
  },
});

export const AIGeneratingJapanese = meta.story({
  args: {
    state: aiGeneratingJapaneseState,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('AI説明文を生成中...')).toBeInTheDocument();
    await expect(canvas.getByText('90%')).toBeInTheDocument();
  },
});

export const StoringResults = meta.story({
  args: {
    state: storingResultsState,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('結果を保存中...')).toBeInTheDocument();
    await expect(canvas.getByText('95%')).toBeInTheDocument();
  },
});

export const Completed = meta.story({
  args: {
    state: completedState,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('COMPLETE')).toBeInTheDocument();
    await expect(canvas.getByText('10/10 repos')).toBeInTheDocument();
  },
});

export const Error = meta.story({
  args: {
    state: errorState,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('IDLE')).toBeInTheDocument();
    await expect(canvas.getByText('Rate limit exceeded. Please try again later.')).toBeInTheDocument();
  },
});
