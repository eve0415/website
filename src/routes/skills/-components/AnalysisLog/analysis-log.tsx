// AnalysisLog - Terminal-style progress widget for workflow status

import type { WorkflowPhase, WorkflowState } from '../../-utils/ai-skills-types';
import type { FC } from 'react';

import { useEffect, useState } from 'react';

import { canShowRepoName } from '../../-utils/privacy-filter';

interface Props {
  state: WorkflowState;
}

const phaseMessages: Record<string, string> = {
  idle: '待機中',
  'listing-repos': 'リポジトリを取得中...',
  'fetching-commits': 'コミット履歴を取得中...',
  'fetching-prs': 'プルリクエストを取得中...',
  'fetching-reviews': 'レビューを取得中...',
  'squashing-history': '履歴を要約中...',
  'ai-extracting-skills': 'AIがスキルを分析中...',
  'ai-generating-japanese': 'AI説明文を生成中...',
  'storing-results': '結果を保存中...',
  completed: '完了',
  error: 'エラーが発生しました',
};

const AnalysisLog: FC<Props> = ({ state }) => {
  const [blinkVisible, setBlink] = useState(true);

  // Heartbeat blink effect
  useEffect(() => {
    if (state.phase === 'idle' || state.phase === 'completed' || state.phase === 'error') {
      return;
    }

    const interval = setInterval(() => {
      setBlink(prev => !prev);
    }, 1000);

    return () => clearInterval(interval);
  }, [state.phase]);

  const isActive = state.phase !== 'idle' && state.phase !== 'completed' && state.phase !== 'error';
  const currentMessage = getPhaseMessage(state.phase, state);

  return (
    <div className='border-line bg-surface/80 fixed right-4 bottom-4 z-40 w-80 max-w-[calc(100vw-2rem)] rounded-lg border backdrop-blur-sm'>
      {/* Header */}
      <div className='border-line flex items-center justify-between border-b px-3 py-2'>
        <div className='flex items-center gap-2'>
          <span className={`size-2 rounded-full ${isActive ? 'bg-fuchsia animate-heartbeat' : state.phase === 'completed' ? 'bg-neon' : 'bg-muted'}`} />
          <span className='text-subtle-foreground font-mono text-xs uppercase'>
            {isActive ? 'LIVE ANALYZING' : state.phase === 'completed' ? 'COMPLETE' : 'IDLE'}
          </span>
        </div>
        {isActive && <span className='text-fuchsia font-mono text-xs'>{state.progress_pct}%</span>}
      </div>

      {/* Current status */}
      <div className='h-16 overflow-hidden p-3'>
        <div className='flex flex-col gap-1'>
          {state.current_repo && (
            <p className='text-muted-foreground font-mono text-xs'>
              <span className='text-subtle-foreground mr-2'>{'>'}</span>
              {getRepoMessage(state.current_repo)}
            </p>
          )}
          {isActive && (
            <p className='text-fuchsia font-mono text-xs'>
              <span className='mr-2'>{'>'}</span>
              {phaseMessages[state.phase]}
              <span className={`ml-1 ${blinkVisible ? 'opacity-100' : 'opacity-0'}`}>_</span>
            </p>
          )}
          {!isActive && currentMessage && (
            <p className='text-muted-foreground font-mono text-xs'>
              <span className='text-subtle-foreground mr-2'>{'>'}</span>
              {currentMessage}
            </p>
          )}
        </div>
      </div>

      {/* Footer with stats */}
      {state.repos_total > 0 && (
        <div className='border-line border-t px-3 py-2'>
          <span className='text-subtle-foreground font-mono text-xs'>
            {state.repos_processed}/{state.repos_total} repos
          </span>
        </div>
      )}
    </div>
  );
};

function getRepoMessage(repoName: string): string {
  // Privacy check - only show public repo names
  const isPublic = canShowRepoName({ privacyClass: 'self' }); // Simplified - would need actual repo privacy class
  if (isPublic) {
    return `Scanning ${repoName}...`;
  }
  return 'Scanning private repository...';
}

function getPhaseMessage(phase: WorkflowPhase, state: WorkflowState): string | null {
  switch (phase) {
    case 'listing-repos':
      return 'Enumerating repositories...';
    case 'squashing-history':
      return 'Compressing history data...';
    case 'ai-extracting-skills':
      return 'Running skill extraction model...';
    case 'ai-generating-japanese':
      return 'Generating Japanese descriptions...';
    case 'storing-results':
      return 'Writing to KV store...';
    case 'completed':
      return `Analysis complete. ${state.repos_processed} repos processed.`;
    case 'error':
      return state.error_message || 'An error occurred.';
    default:
      return null;
  }
}

export default AnalysisLog;
